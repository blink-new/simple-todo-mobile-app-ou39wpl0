
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Check, Plus, Trash2 } from "lucide-react-native";
import { useFonts, Raleway_700Bold, Raleway_400Regular } from "@expo-google-fonts/raleway";

const ACCENT = "#7C3AED"; // playful purple
const ACCENT2 = "#F472B6"; // playful pink
const BG_GRADIENT_START = "#F7F0FF";
const BG_GRADIENT_END = "#E0EAFC";
const CARD = "#FFFFFF";
const TEXT = "#22223B";
const SUBTLE = "#9A9AB0";
const COMPLETE = "#B2F2BB";
const SHADOW = "#E0E0F7";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

function GradientBackground({ children }: { children: React.ReactNode }) {
  // Simple gradient using two absolutely positioned Views
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.gradientBg} />
      {children}
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🦄</Text>
      <Text style={styles.emptyText}>No todos yet!</Text>
      <Text style={styles.emptySub}>Tap the + to add your first task.</Text>
    </View>
  );
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
}: {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const anim = useRef(new Animated.Value(todo.completed ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: todo.completed ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.out(Easing.exp),
    }).start();
  }, [todo.completed]);

  const bgColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [CARD, COMPLETE],
  });

  return (
    <Animated.View style={[styles.todoCard, { backgroundColor: bgColor }]}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={onToggle}
        accessibilityLabel={todo.completed ? "Mark as incomplete" : "Mark as complete"}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.checkboxBase,
            todo.completed && { backgroundColor: ACCENT, borderColor: ACCENT },
          ]}
        >
          {todo.completed && <Check color="#fff" size={20} />}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.todoTextWrap}
        onPress={onEdit}
        accessibilityLabel="Edit todo"
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.todoText,
            todo.completed && { textDecorationLine: "line-through", color: SUBTLE },
          ]}
          numberOfLines={2}
        >
          {todo.text}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={onDelete}
        accessibilityLabel="Delete todo"
        activeOpacity={0.7}
      >
        <Trash2 color={SUBTLE} size={22} />
      </TouchableOpacity>
    </Animated.View>
  );
}

function TodoModal({
  visible,
  onClose,
  onSave,
  initialText,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  initialText?: string;
}) {
  const [text, setText] = useState(initialText || "");

  React.useEffect(() => {
    setText(initialText || "");
  }, [initialText, visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalContainer}
        >
          <Animated.View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {initialText ? "Edit Todo" : "New Todo"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="What needs to be done?"
              value={text}
              onChangeText={setText}
              autoFocus
              maxLength={100}
              placeholderTextColor={SUBTLE}
              onSubmitEditing={() => {
                if (text.trim()) {
                  onSave(text.trim());
                }
              }}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalBtn,
                  { backgroundColor: pressed ? "#ececff" : ACCENT },
                ]}
                onPress={() => {
                  if (text.trim()) {
                    onSave(text.trim());
                  }
                }}
                accessibilityLabel="Save todo"
              >
                <Text style={styles.modalBtnText}>Save</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalBtn,
                  { backgroundColor: pressed ? "#f2f2f2" : "#fff", borderWidth: 1, borderColor: ACCENT },
                ]}
                onPress={onClose}
                accessibilityLabel="Cancel"
              >
                <Text style={[styles.modalBtnText, { color: ACCENT }]}>Cancel</Text>
              </Pressable>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);

  let [fontsLoaded] = useFonts({
    Raleway_700Bold,
    Raleway_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ fontSize: 20, color: ACCENT }}>Loading...</Text>
      </View>
    );
  }

  const handleAdd = (text: string) => {
    setTodos((prev) => [
      ...prev,
      { id: Date.now().toString(), text, completed: false },
    ]);
    setModalVisible(false);
  };

  const handleEdit = (text: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === editing?.id ? { ...t, text } : t
      )
    );
    setEditing(null);
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggle = (id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  // FAB animation
  const fabScale = useRef(new Animated.Value(1)).current;
  const animateFab = () => {
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 1.12,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GradientBackground>
        <View style={styles.container}>
          <Text style={styles.header}>My Todos</Text>
          <FlatList
            data={todos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
            renderItem={({ item }) => (
              <TodoItem
                todo={item}
                onToggle={() => handleToggle(item.id)}
                onDelete={() => handleDelete(item.id)}
                onEdit={() => {
                  setEditing({ id: item.id, text: item.text });
                  setModalVisible(true);
                }}
              />
            )}
            ListEmptyComponent={<EmptyState />}
            showsVerticalScrollIndicator={false}
          />
          <Animated.View style={[styles.fabShadow, { transform: [{ scale: fabScale }] }]}>
            <TouchableOpacity
              style={styles.fab}
              onPress={() => {
                animateFab();
                setEditing(null);
                setModalVisible(true);
              }}
              accessibilityLabel="Add todo"
              activeOpacity={0.8}
            >
              <Plus color="#fff" size={32} />
            </TouchableOpacity>
          </Animated.View>
          <TodoModal
            visible={modalVisible}
            onClose={() => {
              setEditing(null);
              setModalVisible(false);
            }}
            onSave={(text) => {
              if (editing) {
                handleEdit(text);
              } else {
                handleAdd(text);
              }
            }}
            initialText={editing?.text}
          />
        </View>
      </GradientBackground>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_GRADIENT_START,
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    backgroundColor: BG_GRADIENT_START,
    // Simulate a gradient with two overlapping views
    // (for real gradients, use expo-linear-gradient, but keeping it dependency-free)
    borderBottomLeftRadius: width * 0.7,
    borderBottomRightRadius: width * 0.7,
    height: 340,
    top: -80,
    left: -width * 0.1,
    right: -width * 0.1,
    background: undefined,
    backgroundColor: BG_GRADIENT_START,
    shadowColor: ACCENT2,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    fontFamily: "Raleway_700Bold",
    fontSize: 36,
    color: ACCENT,
    marginBottom: 22,
    marginTop: 18,
    letterSpacing: 0.5,
    textShadowColor: "#f3e8ff",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  todoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 16,
    shadowColor: "#B794F4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 4,
  },
  checkbox: {
    marginRight: 18,
  },
  checkboxBase: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: ACCENT,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: ACCENT2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  todoTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  todoText: {
    fontFamily: "Raleway_400Regular",
    fontSize: 20,
    color: TEXT,
    letterSpacing: 0.1,
  },
  deleteBtn: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 10,
    backgroundColor: "#F8F0FC",
    shadowColor: "#F472B6",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  fabShadow: {
    position: "absolute",
    right: 28,
    bottom: 44,
    borderRadius: 36,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 10,
  },
  fab: {
    backgroundColor: ACCENT,
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: ACCENT2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
  emptyEmoji: {
    fontSize: 70,
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: "Raleway_700Bold",
    fontSize: 26,
    color: ACCENT,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  emptySub: {
    fontFamily: "Raleway_400Regular",
    fontSize: 18,
    color: SUBTLE,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(247,240,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  modalCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 28,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
    alignItems: "stretch",
  },
  modalTitle: {
    fontFamily: "Raleway_700Bold",
    fontSize: 22,
    color: ACCENT,
    marginBottom: 18,
    textAlign: "center",
  },
  input: {
    fontFamily: "Raleway_400Regular",
    fontSize: 20,
    borderWidth: 1.5,
    borderColor: ACCENT,
    borderRadius: 12,
    padding: 14,
    marginBottom: 22,
    color: TEXT,
    backgroundColor: "#f8f8ff",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 14,
  },
  modalBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginLeft: 10,
  },
  modalBtnText: {
    fontFamily: "Raleway_700Bold",
    fontSize: 17,
    color: "#fff",
  },
});