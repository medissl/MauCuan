import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { type } from './ui';

// Reserved space below the decorated interior, within the same room frame.
// Native font fitting keeps a long question in the same space as a greeting.
export function PetSpeech({ text, action, onPress }: { text: string; action?: string; onPress?: () => void }) {
  const fontSize = text.length > 170 ? 13 : text.length > 110 ? 14 : 16;
  return <View testID="pet-speech" style={{ height: 124, marginHorizontal: 12, marginBottom: 12, backgroundColor: '#FFF4E7', borderColor: '#00323E', borderWidth: 2, borderRadius: 24, paddingHorizontal: 16, paddingTop: 12 }}>
    <Text accessibilityLiveRegion="polite" accessibilityLabel={text} adjustsFontSizeToFit minimumFontScale={12 / fontSize} numberOfLines={5} style={[type.heading, { color: '#00323E', fontSize, flex: 1 }]}>{text}</Text>
    <View style={{ height: 44 }}>{action && <Pressable accessibilityRole="button" accessibilityLabel={action} onPress={onPress} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={[type.heading, { color: '#007D91', fontSize: 12 }]}>{action} →</Text></Pressable>}</View>
    <Svg pointerEvents="none" width="32" height="20" viewBox="0 0 32 20" style={{ position: 'absolute', top: -19, left: '45%' }}><Path d="M1 19L17 2L30 19" fill="#FFF4E7" stroke="#00323E" strokeWidth="2" strokeLinejoin="round" /><Path d="M3 20H28" stroke="#FFF4E7" strokeWidth="4" /></Svg>
  </View>;
}
