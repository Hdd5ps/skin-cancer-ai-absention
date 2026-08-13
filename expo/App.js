import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const API_URL = "http://127.0.0.1:8000/predict";

function StatusCard({ title, subtitle, tone = "neutral", children }) {
  const toneStyle = useMemo(() => {
    if (tone === "danger") return styles.cardDanger;
    if (tone === "warning") return styles.cardWarning;
    if (tone === "success") return styles.cardSuccess;
    return styles.cardNeutral;
  }, [tone]);

  return (
    <View style={[styles.card, toneStyle]}>
      <Text style={styles.cardTitle}>{title}</Text>
      {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow photo access to continue.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets?.[0];
    if (!asset?.uri) {
      Alert.alert("Selection error", "Could not read selected image.");
      return;
    }

    setSelectedImage(asset);
    setResponse(null);
    setError(null);
  };

  const analyzeImage = async () => {
    if (!selectedImage?.uri) {
      Alert.alert("No image selected", "Please choose an image first.");
      return;
    }

    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const filename = selectedImage.fileName || "lesion.jpg";
      const mimeType = selectedImage.mimeType || "image/jpeg";

      const formData = new FormData();
      formData.append("file", {
        uri: selectedImage.uri,
        name: filename,
        type: mimeType,
      });

      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.detail || `Request failed with HTTP ${res.status}`);
      }

      setResponse(data);
    } catch (err) {
      setError(err?.message || "Unknown network error");
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!response) {
      return null;
    }

    if (response.gate === 1 || response.status === "blur_error") {
      return (
        <StatusCard
          title="Blurry Image"
          subtitle="Gate 1 quality check detected insufficient sharpness."
          tone="warning"
        >
          <Text style={styles.metric}>Blur variance: {response.blur_variance?.toFixed?.(2) ?? response.blur_variance}</Text>
          <Text style={styles.helper}>Retake with better lighting and focus.</Text>
        </StatusCard>
      );
    }

    if (response.gate === 2 || response.status === "low_confidence") {
      return (
        <StatusCard
          title="Low Confidence Abstention"
          subtitle="Gate 2 withheld prediction due to uncertainty."
          tone="warning"
        >
          <Text style={styles.metric}>Confidence: {response.confidence}</Text>
          <Text style={styles.helper}>Please capture a clearer lesion image or consult a clinician.</Text>
        </StatusCard>
      );
    }

    return (
      <StatusCard
        title="Prediction Complete"
        subtitle="Model confidence passed both quality and uncertainty gates."
        tone="success"
      >
        <Text style={styles.metric}>Label: {response.label}</Text>
        <Text style={styles.metric}>ICD-10: {response.icd10}</Text>
        <Text style={styles.metric}>Confidence: {response.confidence}</Text>
      </StatusCard>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>DermaScan AI</Text>
        <Text style={styles.subtitle}>Clinical screening assistant for skin lesion triage</Text>

        <View style={styles.previewCard}>
          {selectedImage?.uri ? (
            <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <Text style={styles.placeholder}>No image selected</Text>
          )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={pickImage}>
            <Text style={styles.buttonTextSecondary}>Select Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={analyzeImage}>
            <Text style={styles.buttonTextPrimary}>Analyze</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#0f766e" />
            <Text style={styles.loadingText}>Running dual-gated analysis...</Text>
          </View>
        ) : null}

        {error ? (
          <StatusCard title="Request Error" subtitle={error} tone="danger">
            <Text style={styles.helper}>Confirm API_URL and backend server availability.</Text>
          </StatusCard>
        ) : null}

        {renderResult()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f4f7f8",
  },
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0b1f2a",
  },
  subtitle: {
    fontSize: 14,
    color: "#4b5d67",
    marginTop: -6,
  },
  previewCard: {
    borderRadius: 16,
    height: 260,
    backgroundColor: "#dfe7ea",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    color: "#6b7d87",
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: "#0f766e",
  },
  buttonSecondary: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#a8bcc6",
  },
  buttonTextPrimary: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
  buttonTextSecondary: {
    color: "#14303d",
    fontWeight: "600",
    fontSize: 15,
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ecf7f5",
    padding: 12,
    borderRadius: 12,
  },
  loadingText: {
    color: "#215e5a",
    fontSize: 13,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
  },
  cardNeutral: {
    backgroundColor: "#f6f8f9",
    borderColor: "#d1dbe0",
  },
  cardWarning: {
    backgroundColor: "#fff6eb",
    borderColor: "#f4c58a",
  },
  cardDanger: {
    backgroundColor: "#fff0f0",
    borderColor: "#f3b1b1",
  },
  cardSuccess: {
    backgroundColor: "#edf8f1",
    borderColor: "#9ad4b0",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#102430",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#4f6671",
  },
  metric: {
    fontSize: 14,
    color: "#132f3a",
    fontWeight: "500",
  },
  helper: {
    fontSize: 12,
    color: "#58707b",
  },
});
