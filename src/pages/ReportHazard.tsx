import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { 
  AlertTriangle, 
  MapPin, 
  Mic, 
  MicOff, 
  Send,
  Droplets,
  Thermometer,
  Zap,
  Eye
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
// @ts-ignore - firebase.js is a JS module
import { db, storage } from '../firebase';
// @ts-ignore - firebase.js is a JS module
import { ref, push } from 'firebase/database';
// @ts-ignore - firebase.js is a JS module
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

interface HazardForm {
  type: string;
  severity: string;
  title: string;
  description: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  contactInfo: string;
  anonymous: boolean;
}

// Speech recognition interface
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

const ReportHazard = () => {
  const { t, i18n } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [description, setDescription] = useState('');
  const descriptionRef = useRef<string>('');
  const transcriptRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [selectedHazardType, setSelectedHazardType] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  const { register, handleSubmit, formState: { errors }, setValue, clearErrors } = useForm<HazardForm>({
    mode: 'onSubmit',
    defaultValues: {
      anonymous: false,
      coordinates: { lat: 0, lng: 0 },
      type: '',
      severity: '',
      title: '',
      description: '',
      location: ''
    }
  });

  const hazardTypes = [
    { value: 'contamination', label: 'Water Contamination', icon: Droplets, color: 'text-blue-600' },
    { value: 'flooding', label: 'Flooding/High Water', icon: AlertTriangle, color: 'text-red-600' },
    { value: 'chemical', label: 'Chemical Spill', icon: Zap, color: 'text-yellow-600' },
    { value: 'temperature', label: 'Temperature Anomaly', icon: Thermometer, color: 'text-orange-600' },
    { value: 'infrastructure', label: 'Infrastructure Damage', icon: AlertTriangle, color: 'text-gray-600' },
    { value: 'other', label: 'Other Hazard', icon: Eye, color: 'text-purple-600' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', description: 'Minor concern, no immediate danger', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', description: 'Moderate risk, attention needed', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', description: 'Significant risk, urgent response needed', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', description: 'Immediate danger, emergency response required', color: 'bg-red-100 text-red-800' }
  ];

  const getCurrentLocation = () => {
    setUseCurrentLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('coordinates.lat', position.coords.latitude);
          setValue('coordinates.lng', position.coords.longitude);
          setValue('location', `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
          setUseCurrentLocation(false);
          addNotification({
            type: 'success',
            title: t('common.success'),
            message: t('reportHazard.location') + ' ' + t('common.success')
          });
        },
        (_error) => {
          setUseCurrentLocation(false);
          addNotification({
            type: 'error',
            title: t('common.error'),
            message: t('reportHazard.location') + ': Unable to get your current location. Please enter manually.'
          });
        }
      );
    } else {
      setUseCurrentLocation(false);
      addNotification({
        type: 'error',
        title: 'Location Not Supported',
        message: 'Geolocation is not supported by your browser.'
      });
    }
  };
  
  const handleVoiceRecording = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addNotification({
        type: 'error',
        title: t('common.error'),
        message: 'Speech recognition is not supported in your browser. Please use Chrome or Edge.'
      });
      return;
    }

    // If currently recording, stop and finalize
    if (isRecordingRef.current) {
      console.log('Stopping voice recording...');
      // Immediately update state to prevent double clicks
      isRecordingRef.current = false;
      setIsRecording(false);
      
      if (recognitionRef.current) {
        // Append transcript to description
        const newDescription = (descriptionRef.current + ' ' + transcriptRef.current).trim();
        console.log('📝 Appending transcript:', transcriptRef.current);
        console.log('📝 New description:', newDescription);
        setDescription(newDescription);
        setValue('description', newDescription, { shouldDirty: true, shouldTouch: true });
        transcriptRef.current = '';
        descriptionRef.current = '';
        
        recognitionRef.current.stop();
        recognitionRef.current = null;
        
        addNotification({
          type: 'success',
          title: 'Voice Recording Stopped',
          message: 'Your voice description has been added.'
        });
      }
      return;
    }

    try {
      console.log('Starting voice recording...');
      
      // Check if we can request permissions
      let hasPermission = false;
      try {
        console.log('Requesting microphone permission...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Permission granted, stopping stream...');
        stream.getTracks().forEach(track => track.stop());
        hasPermission = true;
      } catch (permissionError: any) {
        console.error('Permission error:', permissionError.name, permissionError.message);
        if (permissionError.name === 'NotAllowedError') {
          addNotification({
            type: 'error',
            title: 'Permission Denied',
            message: 'Microphone access was denied. Please enable it in your browser settings and try again.'
          });
          return;
        } else if (permissionError.name === 'NotFoundError') {
          addNotification({
            type: 'error',
            title: 'No Microphone Found',
            message: 'No microphone device found on this device.'
          });
          return;
        } else {
          throw permissionError;
        }
      }

      if (!hasPermission) {
        throw new Error('Microphone permission not granted');
      }

      // Map app language to SpeechRecognition locale
      const languageMap: { [key: string]: string } = {
        'en': 'en-IN',
        'te': 'te-IN',
        'hi': 'hi-IN',
        'ta': 'ta-IN',
        'ml': 'ml-IN'
      };
      const currentLang = i18n.language || 'en';
      const recognitionLang = languageMap[currentLang] || 'en-IN';
      console.log(`Setting speech recognition language to: ${recognitionLang} (app language: ${currentLang})`);

      // Start speech recognition only after permission success
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = recognitionLang;
      recognitionRef.current = recognition;
      transcriptRef.current = '';

      recognition.onstart = () => {
        console.log('Speech recognition started');
        // Store the current description as base
        descriptionRef.current = description;
        isRecordingRef.current = true;
        setIsRecording(true);
        addNotification({
          type: 'info',
          title: 'Voice Recording Started',
          message: 'Speak clearly to describe the hazard. Tap the microphone again to stop.'
        });
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const alt = event.results[i][0];
          if (event.results[i].isFinal) {
            finalTranscript += alt.transcript + ' ';
          } else {
            interimTranscript += alt.transcript;
          }
        }
        
        if (finalTranscript) {
          transcriptRef.current += finalTranscript;
          console.log('🎤 Captured:', finalTranscript);
          
          // Update description state in real-time using the base description
          const newDescription = (descriptionRef.current + ' ' + transcriptRef.current).trim();
          setDescription(newDescription);
          setValue('description', newDescription, { shouldDirty: true });
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        isRecordingRef.current = false;
        setIsRecording(false);
        addNotification({
          type: 'error',
          title: 'Recording Error',
          message: `Speech recognition error: ${event.error}`
        });
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        // Only update state if not already stopped by user
        if (isRecordingRef.current) {
          isRecordingRef.current = false;
          setIsRecording(false);
          // Append accumulated transcript
          const newDescription = (descriptionRef.current + ' ' + transcriptRef.current).trim();
          setDescription(newDescription);
          setValue('description', newDescription, { shouldDirty: true });
          transcriptRef.current = '';
          descriptionRef.current = '';
          addNotification({
            type: 'success',
            title: 'Voice Recording Complete',
            message: 'Your voice description has been transcribed successfully.'
          });
        }
      };

      console.log('Starting recognition...');
      recognition.start();
    } catch (err: any) {
      console.error('Voice recording error:', err);
      isRecordingRef.current = false;
      setIsRecording(false);
      
      addNotification({
        type: 'error',
        title: 'Microphone Error',
        message: err.message || 'Unable to access microphone. Please check your browser settings.'
      });
    }
  };


  const getFreshCoordinates = () => {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const parseManualLocation = (locationStr?: string) => {
    if (!locationStr || typeof locationStr !== 'string') return null;
    const parts = locationStr.split(',').map((p: string) => Number(p.trim())) as [number, number];
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[0] !== 0 && parts[1] !== 0) {
      return { lat: parts[0], lng: parts[1] };
    }
    return null;
  };

  const onSubmit = async (data: HazardForm) => {
    setIsSubmitting(true);
    try {
      const isAnon = data.anonymous || !user;

      let locationValue: { lat: number; lng: number } | null = null;
      try {
        locationValue = await getFreshCoordinates();
        console.log('✅ Fresh geolocation captured:', locationValue);
      } catch (geoError: any) {
        console.error('Geolocation error, falling back to manual/default:', geoError);
        const manual = parseManualLocation(data.location);
        if (manual) {
          locationValue = manual;
          console.log('⚠️ Using manual location fallback:', manual);
        } else {
          locationValue = { lat: 20.5937, lng: 78.9629 };
          console.log('⚠️ Using default location fallback (India center).');
        }
      }

      // Photos disabled for now - Firebase Storage rules need setup

      const payload = {
        hazardType: data.type,
        description: data.description,
        severity: data.severity,
        title: data.title,
        location: locationValue,
        submittedBy: isAnon ? 'anonymous' : (user?.name ?? 'anonymous'),
        reporterName: isAnon ? 'Anonymous' : (user?.name ?? 'Anonymous'),
        verified: false,
        timestamp: Date.now(),
        contactInfo: data.contactInfo || null,
        anonymous: isAnon
      };

      console.log('📤 Submitting hazard report:', payload);

      // Save to Firebase (append-only via push)
      const reportsRef = ref(db, 'hazards/reports');
      const newReportRef = await push(reportsRef, payload);
      console.log('✅ Hazard report saved with ID:', newReportRef.key);

      addNotification({
        type: 'success',
        title: 'Hazard Report Submitted',
        message: 'Your report has been submitted successfully. Emergency services have been notified.'
      });

      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Error submitting report:', error);
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'There was an error submitting your report. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHazardTypeClick = (value: string) => {
    if (selectedHazardType === value) {
      // Deselect
      setSelectedHazardType('');
      setValue('type', '');
    } else {
      // Select
      setSelectedHazardType(value);
      setValue('type', value);
      clearErrors('type');
    }
  };

  const handleSeverityClick = (value: string) => {
    if (selectedSeverity === value) {
      setSelectedSeverity('');
      setValue('severity', '');
    } else {
      setSelectedSeverity(value);
      setValue('severity', value);
      clearErrors('severity');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('reportHazard.title')}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('reportHazard.subtitle')}
          </p>
        </motion.div>

        {/* Emergency Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8"
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">{t('reportHazard.emergency')}</h3>
              <p className="text-red-700 text-sm">
                {t('reportHazard.emergencyDesc')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Report Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Hazard Type */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                {t('reportHazard.hazardType')} <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hazardTypes.map((type) => (
                  <div 
                    key={type.value}
                    onClick={() => handleHazardTypeClick(type.value)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedHazardType === type.value
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <type.icon className={`h-6 w-6 ${type.color}`} />
                      <span className="font-medium text-gray-900">{t(`reportHazard.types.${type.value}`)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <input type="hidden" {...register('type', { required: t('reportHazard.validation.selectType') })} />
              {errors.type && (
                <p className="mt-2 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            {/* Severity Level */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                {t('reportHazard.severity')} <span className="text-red-600">*</span>
              </label>
              <div className="space-y-3">
                {severityLevels.map((level) => (
                  <div
                    key={level.value}
                    onClick={() => handleSeverityClick(level.value)}
                    className={`flex items-start space-x-3 cursor-pointer rounded-lg p-2 transition-colors border-2 ${
                      selectedSeverity === level.value 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-transparent hover:border-blue-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${level.color}`}>
                          {t(`reportHazard.severityLevels.${level.value}.label`)}
                        </span>
                        <span className="text-gray-700">{t(`reportHazard.severityLevels.${level.value}.description`)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <input type="hidden" {...register('severity', { required: t('reportHazard.validation.selectSeverity') })} />
              {errors.severity && (
                <p className="mt-2 text-sm text-red-600">{errors.severity.message}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                {t('reportHazard.title_label')} <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                {...register('title', { required: t('reportHazard.validation.provideTitle') })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('reportHazard.title_placeholder')}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description with Voice Recording */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                {t('reportHazard.description')} <span className="text-gray-500 font-normal">{t('reportHazard.descriptionHelper')}</span>
              </label>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setDescription(newValue);
                    descriptionRef.current = newValue;
                    setValue('description', newValue, { shouldDirty: true });
                  }}
                  onBlur={() => {
                    setValue('description', description, { shouldDirty: true, shouldTouch: true });
                  }}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder={t('reportHazard.description_placeholder')}
                />
                <button
                  type="button"
                  onClick={handleVoiceRecording}
                  className={`absolute top-3 right-3 p-2 rounded-lg transition-colors ${
                    isRecording 
                      ? 'bg-red-100 text-red-600 animate-pulse' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
              </div>
              {isRecording && (
                <p className="mt-2 text-sm text-red-600 animate-pulse">
                  🔴 {t('reportHazard.voice.recordingHint')}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                {t('reportHazard.location')} <span className="text-red-600">*</span>
              </label>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    {...register('location', { required: t('reportHazard.validation.provideLocation') })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('reportHazard.location_placeholder')}
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={useCurrentLocation}
                    className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <MapPin className="h-5 w-5" />
                    <span>{useCurrentLocation ? t('reportHazard.gettingLocation') : t('reportHazard.useCurrentLocation')}</span>
                  </button>
                </div>
              </div>
              {errors.location && (
                <p className="mt-2 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                {t('reportHazard.contactInfo')}
              </label>
              <input
                type="text"
                {...register('contactInfo')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('reportHazard.contact_placeholder')}
              />
              <div className="mt-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register('anonymous')}
                    className="rounded"
                  />
                  <span className="text-gray-700">{t('reportHazard.anonymous')}</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{t('reportHazard.submitting')}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>{t('reportHazard.submit')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportHazard;