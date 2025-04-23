
import React, { useState, useRef, useEffect } from "react";
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
import { Check, Plus, Trash2, FileText } from "lucide-react-native";
import { useFonts, Inter_700Bold, Inter_400Regular } from "@expo-google-fonts/inter";

const ACCENT = "#111827"; // Vercel dark
const ACCENT2 = "#6366F1"; // Vercel blue accent
const BG_GRADIENT_START = "#F8FAFC";
const CARD = "#FFFFFF";
const TEXT = "#111827";
const SUBTLE = "#6B7280";
const COMPLETE = "#E5E7EB";

type Todo = {
  id: string;
  text: string;
  description: string;
  completed: boolean;
};

const { width } = Dimensions.get("window");

function GradientBackground({ children }: { children: React.ReactNode }) {
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
      <Text style={styles.emptyEmoji}>⚡️</Text>
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

  useEffect(() => {
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
            todo.completed && { backgroundColor: ACCENT2, borderColor: ACCENT2 },
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
        {todo.description ? (
          <Text style={styles.todoDescription} numberOfLines={2}>
            <FileText size={16} color={SUBTLE} style={{ marginRight: 4 }} />
            {todo.description}
          </Text>
        ) : null}
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
  initialDescription,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (text: string, description: string) => void;
  initialText?: string;
  initialDescription?: string;
}) {
  const [text, setText] = useState(initialText || "");
  const [description, setDescription] = useState(initialDescription || "");

  useEffect(() => {
    setText(initialText || "");
    setDescription(initialDescription || "");
  }, [initialText, initialDescription, visible]);

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
                  onSave(text.trim(), description.trim());
                }
              }}
              returnKeyType="next"
              selectionColor={ACCENT2}
            />
            <TextInput
              style={styles.inputDescription}
              placeholder="Add a description or notes (optional)"
              value={description}
              onChangeText={setDescription}
              maxLength={300}
              placeholderTextColor={SUBTLE}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              selectionColor={ACCENT2}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalBtn,
                  { backgroundColor: pressed ? "#e0e7ff" : ACCENT2 },
                ]}
                onPress={() => {
                  if (text.trim()) {
                    onSave(text.trim(), description.trim());
                  }
                }}
                accessibilityLabel="Save todo"
              >
                <Text style={styles.modalBtnText}>Save</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalBtn,
                  { backgroundColor: pressed ? "#f3f4f6" : "#fff", borderWidth: 1, borderColor: ACCENT2 },
                ]}
                onPress={onClose}
                accessibilityLabel="Cancel"
              >
                <Text style={[styles.modalBtnText, { color: ACCENT2 }]}>Cancel</Text>
              </Pressable>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export default function App() {
  let [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
  });

  const [todos, setTodos] = useState<Todo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<{ id: string; text: string; description: string } | null>(null);

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

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ fontSize: 20, color: ACCENT2 }}>Loading...</Text>
      </View>
    );
  }

  // Sort: incomplete first, then completed
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  const handleAdd = (text: string, description: string) => {
    setTodos((prev) => [
      ...prev,
      { id: Date.now().toString(), text, description, completed: false },
    ]);
    setModalVisible(false);
  };

  const handleEdit = (text: string, description: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === editing?.id ? { ...t, text, description } : t
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <GradientBackground>
        <View style={styles.container}>
          <Text style={styles.header}>My Todos</Text>
          <FlatList
            data={sortedTodos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
            renderItem={({ item }) => (
              <TodoItem
                todo={item}
                onToggle={() => handleToggle(item.id)}
                onDelete={() => handleDelete(item.id)}
                onEdit={() => {
                  setEditing({ id: item.id, text: item.text, description: item.description });
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
            onSave={(text, description) => {
              if (editing) {
                handleEdit(text, description);
              } else {
                handleAdd(text, description);
              }
            }}
            initialText={editing?.text}
            initialDescription={editing?.description}
          />
        </View>
      </GradientBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_GRADIENT_START,
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    backgroundColor: BG_GRADIENT_START,
    borderBottomLeftRadius: width * 0.7,
    borderBottomRightRadius: width * 0.7,
    height: 340,
    top: -80,
    left: -width * 0.1,
    right: -width * 0.1,
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
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    color: ACCENT,
    marginBottom: 22,
    marginTop: 18,
    letterSpacing: 0.5,
    textShadowColor: "#e0e7ef",
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
    shadowColor: "#6366F1",
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
    borderColor: ACCENT2,
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
    fontFamily: "Inter_400Regular",
    fontSize: 20,
    color: TEXT,
    letterSpacing: 0.1,
  },
  todoDescription: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: SUBTLE,
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  deleteBtn: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    shadowColor: "#6366F1",
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
    shadowColor: ACCENT2,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 10,
  },
  fab: {
    backgroundColor: ACCENT2,
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
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: ACCENT2,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  emptySub: {
    fontFamily: "Inter_400Regular",
    fontSize: 18,
    color: SUBTLE,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(248,250,252,0.92)",
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
    shadowColor: ACCENT2,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
    alignItems: "stretch",
  },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: ACCENT2,
    marginBottom: 18,
    textAlign: "center",
  },
  input: {
    fontFamily: "Inter_400Regular",
    fontSize: 20,
    borderWidth: 1.5,
    borderColor: ACCENT2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    color: TEXT,
    backgroundColor: "#f3f4f6",
  },
  inputDescription: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    borderWidth: 1,
    borderColor: ACCENT2,
    borderRadius: 10,
    padding: 12,
    marginBottom: 22,
    color: TEXT,
    backgroundColor: "#f3f4f6",
    minHeight: 60,
    maxHeight: 120,
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
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: "#fff",
  },
});