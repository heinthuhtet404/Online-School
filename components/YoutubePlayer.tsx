import {
  View,
  Text,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Modal,
} from "react-native";
import WebView from "react-native-webview";
import { useRef, useState, useCallback, useEffect } from "react";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;

type Props = {
  videoId: string;
  title?: string;
  onClose?: () => void;
};

export function extractYoutubeId(input: string): string | null {
  if (!input) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1];
  }
  return null;
}

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

export default function YoutubePlayer({ videoId, title = "သင်ခန်းစာ", onClose }: Props) {
  const webRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [seekbarWidth, setSeekbarWidth] = useState(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ===== Auto-hide (settings ဖွင့်ထားရင် မဖျောက်) =====
  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (settingsOpen) return;
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
  }, [settingsOpen]);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    scheduleHide();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [scheduleHide, settingsOpen]);

  // ===== Commands =====
  const sendCmd = useCallback((cmd: string) => {
    webRef.current?.injectJavaScript(`
      (function(){ try { ${cmd} } catch(e){} true; })();
    `);
  }, []);

  const togglePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (playing) {
      sendCmd("player.pauseVideo();");
      setPlaying(false);
    } else {
      sendCmd("player.playVideo();");
      setPlaying(true);
    }
    showControls();
  };

  const seekBy = (sec: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendCmd(`player.seekTo(player.getCurrentTime() + ${sec}, true);`);
    showControls();
  };

  const seekToFraction = (frac: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendCmd(`player.seekTo(player.getDuration() * ${frac}, true);`);
    showControls();
  };

  const toggleMute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (muted) {
      sendCmd("player.unMute();");
      setMuted(false);
    } else {
      sendCmd("player.mute();");
      setMuted(true);
    }
    showControls();
  };

  const changeSpeed = (s: number) => {
    Haptics.selectionAsync();
    sendCmd(`player.setPlaybackRate(${s});`);
    setSpeed(s);
    showControls();
  };

  // ===== HTML =====
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta name="referrer" content="strict-origin-when-cross-origin">
        <style>
          html, body { margin:0; padding:0; background:#000; height:100%; overflow:hidden; }
          #player { width:100%; height:100%; }
          iframe { pointer-events:none; }
        </style>
      </head>
      <body>
        <div id="player"></div>
        <script>
          var tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api";
          document.head.appendChild(tag);
          var player, tick;
          function onYouTubeIframeAPIReady() {
            player = new YT.Player('player', {
              videoId: '${videoId}',
              host: 'https://www.youtube-nocookie.com',
              playerVars: {
                playsinline: 1, rel: 0, modestbranding: 1,
                controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3,
                origin: 'https://www.youtube-nocookie.com'
              },
              events: {
                'onReady': function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ready', duration: player.getDuration()
                  }));
                  tick = setInterval(function() {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'tick', current: player.getCurrentTime(), duration: player.getDuration()
                    }));
                  }, 500);
                },
                'onStateChange': function(e) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'state', value: e.data }));
                }
              }
            });
          }
        </script>
      </body>
    </html>
  `;

  const onMessage = (event: any) => {
    try {
      const d = JSON.parse(event.nativeEvent.data);
      if (d.type === "ready") {
        setReady(true);
        if (d.duration) setDuration(d.duration);
      }
      if (d.type === "state") {
        if (d.value === 1) setPlaying(true);
        if (d.value === 2 || d.value === 0) setPlaying(false);
      }
      if (d.type === "tick") {
        setCurrentTime(d.current || 0);
        if (d.duration) setDuration(d.duration);
      }
    } catch {}
  };

  const fmt = (sec: number) => {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r < 10 ? "0" : ""}${r}`;
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <View
      style={{
        width: "100%",
        aspectRatio: 16 / 9,
        backgroundColor: "#000",
        position: "relative",
      }}
    >
      {/* ===== Video (behind) ===== */}
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html, baseUrl: "https://www.youtube-nocookie.com" }}
        style={{ flex: 1, backgroundColor: "#000" }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        onMessage={onMessage}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        mixedContentMode="always"
        scrollEnabled={false}
        pointerEvents="none"  // ← WebView ကို နှိပ်မရအောင် (အောက်က tap layer ပဲ ဖမ်း)
      />

      {/* ===== Loading ===== */}
      {!ready && (
        <View
          style={{
            position: "absolute",
            inset: 0,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.7)",
          }}
        >
          <ActivityIndicator color="#FFF" size="large" />
        </View>
      )}

      {/* ===== Transparent tap-layer (always present) ===== */}
      <Pressable
        onPress={() => {
          if (controlsVisible) {
            setControlsVisible(false);
          } else {
            showControls();
          }
        }}
        style={{ position: "absolute", inset: 0 }}
      />

      {/* ===== Controls overlay ===== */}
      {controlsVisible && ready && (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(180)}
          style={{ position: "absolute", inset: 0 }}
          pointerEvents="box-none"
        >
          {/* ===== Top bar ===== */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              paddingHorizontal: 10,
              paddingVertical: 8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(0,0,0,0.35)",
            }}
            pointerEvents="box-none"
          >
            <GlassButton
              emoji="←"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onClose?.();
              }}
              size="sm"
            />
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                textAlign: "center",
                color: "#FFF",
                fontFamily: "PlusJakartaSans_700Bold",
                fontSize: isTablet ? 14 : 12,
                marginHorizontal: 8,
              }}
            >
              {title}
            </Text>
            <GlassButton
              emoji="⚙️"
              onPress={() => {
                Haptics.selectionAsync();
                setSettingsOpen(true);
                setControlsVisible(true);
              }}
              size="sm"
            />
          </View>

          {/* ===== Center: Rewind / Play / Forward ===== */}
          <View
            style={{
              position: "absolute",
              inset: 0,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: isTablet ? 32 : 22,
            }}
            pointerEvents="box-none"
          >
            <GlassButton
              emoji="⏪"
              onPress={() => seekBy(-10)}
              size={isTablet ? "md" : "sm"}
            />
            <GlassButton
              emoji={playing ? "⏸" : "▶"}
              onPress={togglePlay}
              size={isTablet ? "xl" : "lg"}
              primary
            />
            <GlassButton
              emoji="⏩"
              onPress={() => seekBy(10)}
              size={isTablet ? "md" : "sm"}
            />
          </View>

          {/* ===== Bottom: Seekbar + Time + Mute ===== */}
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              paddingHorizontal: 12,
              paddingVertical: 10,
              backgroundColor: "rgba(0,0,0,0.35)",
              gap: 6,
            }}
            pointerEvents="box-none"
          >
            {/* Seekbar */}
            <Pressable
              onLayout={(e) => setSeekbarWidth(e.nativeEvent.layout.width)}
              onPressIn={(e) => {
                if (seekbarWidth > 0) {
                  const frac = e.nativeEvent.locationX / seekbarWidth;
                  seekToFraction(Math.max(0, Math.min(1, frac)));
                }
              }}
              style={{ height: 24, justifyContent: "center" }}
            >
              <View
                style={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.3)",
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${progress * 100}%`,
                    height: "100%",
                    backgroundColor: "#4055DC",
                  }}
                />
              </View>
              {/* thumb */}
              <View
                style={{
                  position: "absolute",
                  left: `${progress * 100}%`,
                  marginLeft: -6,
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: "#FFF",
                }}
              />
            </Pressable>

            {/* Time + mute row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: "#FFF",
                  fontFamily: "PlusJakartaSans_700Bold",
                  fontSize: 11,
                }}
              >
                {fmt(currentTime)} / {fmt(duration)}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <GlassButton
                  emoji={muted ? "🔇" : "🔊"}
                  onPress={toggleMute}
                  size="xs"
                />
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ===== Settings Bottom Sheet ===== */}
      <Modal
        visible={settingsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setSettingsOpen(false);
          showControls();
        }}
      >
        <Pressable
          onPress={() => {
            setSettingsOpen(false);
            showControls();
          }}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "#1E1E2A",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 40,
            }}
          >
            <View
              style={{
                alignSelf: "center",
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.3)",
                marginBottom: 20,
              }}
            />
            <Text
              style={{
                color: "#FFF",
                fontFamily: "PlusJakartaSans_800ExtraBold",
                fontSize: 18,
                marginBottom: 16,
              }}
            >
              ⚙️ Settings
            </Text>

            {/* Playback Speed */}
            <Text
              style={{
                color: "rgba(255,255,255,0.6)",
                fontFamily: "PlusJakartaSans_700Bold",
                fontSize: 12,
                letterSpacing: 1,
                marginBottom: 10,
              }}
            >
              PLAYBACK SPEED
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {SPEEDS.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => changeSpeed(s)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: speed === s ? "#4055DC" : "rgba(255,255,255,0.08)",
                  }}
                >
                  <Text
                    style={{
                      color: speed === s ? "#FFF" : "rgba(255,255,255,0.8)",
                      fontFamily: "PlusJakartaSans_800ExtraBold",
                      fontSize: 13,
                    }}
                  >
                    {s}x
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text
              style={{
                color: "rgba(255,255,255,0.4)",
                fontFamily: "PlusJakartaSans_600SemiBold",
                fontSize: 11,
                marginTop: 24,
                textAlign: "center",
              }}
            >
              Quality / Subtitle / Audio — နောက်ပိုင်း ထည့်မယ်
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ===== Glass Button =====
function GlassButton({
  emoji,
  onPress,
  size = "md",
  primary = false,
}: {
  emoji: string;
  onPress: () => void;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  primary?: boolean;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const dims = {
    xs: isTablet ? 32 : 28,
    sm: isTablet ? 44 : 38,
    md: isTablet ? 56 : 48,
    lg: isTablet ? 76 : 64,
    xl: isTablet ? 100 : 84,
  };
  const fonts = { xs: 12, sm: 16, md: 20, lg: 26, xl: 36 };
  const dim = dims[size];

  return (
    <Pressable
      onPressIn={() => (scale.value = withSpring(0.86, { damping: 14, stiffness: 380 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 12, stiffness: 300 }))}
      onPress={onPress}
    >
      <Animated.View
        style={[
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            backgroundColor: primary ? "#4055DC" : "rgba(255,255,255,0.18)",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: primary ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.25)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 6,
          },
          anim,
        ]}
      >
        <Text style={{ fontSize: fonts[size], color: "#FFF" }}>{emoji}</Text>
      </Animated.View>
    </Pressable>
  );
}