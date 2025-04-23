
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
} from "react-native";
import { Check, Plus, Trash2, Edit3 } from "lucide-react-native";
import { useFonts, Raleway_700Bold, Raleway_400Regular } from "@expo-google-fonts/raleway";

const ACCENT = "#6C63FF";
const BG = "#F7F7FB";
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

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📝</Text>
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
      >
        <View
          style={[
            styles.checkboxBase,
            todo.completed && { backgroundColor: ACCENT, borderColor: ACCENT },
          ]}
        >
          {todo.completed && <Check color="#fff" size={18} />}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.todoTextWrap}
        onPress={onEdit}
        accessibilityLabel="Edit todo"
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
      >
        <Trash2 color={SUBTLE} size={20} />
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
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalCard}>
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
          </View>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>My Todos</Text>
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
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
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            setEditing(null);
            setModalVisible(true);
          }}
          accessibilityLabel="Add todo"
        >
          <Plus color="#fff" size={28} />
        </TouchableOpacity>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    fontFamily: "Raleway_700Bold",
    fontSize: 32,
    color: TEXT,
    marginBottom: 18,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  todoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    elevation: 2,
  },
  checkbox: {
    marginRight: 14,
  },
  checkboxBase: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ACCENT,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  todoTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  todoText: {
    fontFamily: "Raleway_400Regular",
    fontSize: 18,
    color: TEXT,
  },
  deleteBtn: {
    marginLeft: 6,
    padding: 4,
    borderRadius: 8,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 36,
    backgroundColor: ACCENT,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  emptyEmoji: {
    fontSize: 54,
    marginBottom: 10,
  },
  emptyText: {
    fontFamily: "Raleway_700Bold",
    fontSize: 22,
    color: SUBTLE,
    marginBottom: 4,
  },
  emptySub: {
    fontFamily: "Raleway_400Regular",
    fontSize: 16,
    color: SUBTLE,
  },
  // BEAUTIFUL, SOFT MODAL OVERLAY
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(247,247,251,0.7)", // much lighter, soft overlay
    justifyContent: "center",
    alignItems: "center",
    // Optionally, add a subtle border or shadow for extra polish
  },
  modalContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  modalCard: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: "Raleway_700Bold",
    fontSize: 20,
    color: TEXT,
    marginBottom: 16,
  },
  input: {
    fontFamily: "Raleway_400Regular",
    fontSize: 18,
    borderWidth: 1.5,
    borderColor: ACCENT,
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
    color: TEXT,
    backgroundColor: "#f8f8ff",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    marginLeft: 8,
  },
  modalBtnText: {
    fontFamily: "Raleway_700Bold",
    fontSize: 16,
    color: "#fff",
  },
});