import { Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { normalizePhone } from '../lib/helpers';

export function contactProvider(phone: string, channel: 'call' | 'whatsapp', message: string) {
  const valid = normalizePhone(phone);
  if (!valid) {
    Alert.alert('No real provider number', 'This provider is simulated. To test Call or WhatsApp, add a consenting test phone number in Settings. No invented numbers are dialled.');
    return;
  }
  Alert.alert(channel === 'call' ? 'Call your test contact?' : 'Open WhatsApp?', 'This launches a real phone app for the test number you configured. It does not contact a real roadside provider.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Continue', onPress: () => {
      const url = channel === 'call' ? `tel:${valid}` : `https://wa.me/${valid.replace('+', '')}?text=${encodeURIComponent(message)}`;
      void Linking.openURL(url).catch(() => Alert.alert('Could not open app', 'Check that your phone supports this action and try again.'));
    } },
  ]);
}
