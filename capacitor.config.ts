
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.76a35225110640e49af9daa588203f08',
  appName: 'teacher-timely-reminder',
  webDir: 'dist',
  server: {
    url: 'https://76a35225-1106-40e4-9af9-daa588203f08.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'always'
  },
  android: {
    captureInput: true
  }
};

export default config;
