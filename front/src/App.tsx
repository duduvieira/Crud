import { useState, useEffect } from "react";
import "./App.css";

interface Item {
  id: number;
  nome: string;
}

function App() {
  const [itens, setItens] = useState<Item[]>([]);
  const [pessoa, setPessoa] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showFeedback = (message: string, type: "success" | "error") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const fetchItems = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/items");
      if (!response.ok) throw new Error("Erro ao buscar itens");
      const data = await response.json();
      setItens(data);
    } catch (error) {
      showFeedback("Erro ao buscar itens", "error");
      console.error("Erro ao buscar itens:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async () => {
    if (pessoa.trim() === "") {
      showFeedback("O campo não pode estar vazio", "error");
      return;
    }
    try {
      const url = editId
        ? `http://localhost:3000/api/items/${editId}`
        : "http://localhost:3000/api/items";
      const method = editId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: pessoa }),
      });
      if (response.ok) {
        setPessoa("");
        setEditId(null);
        fetchItems();
        showFeedback(editId ? "Item atualizado com sucesso" : "Item adicionado com sucesso", "success");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao salvar item");
      }
    } catch (error: any) {
      showFeedback(error.message || "Erro ao salvar item", "error");
      console.error("Erro:", error);
    }
  };

  const startEdit = (item: Item) => {
    setPessoa(item.nome);
    setEditId(item.id);
  };

  const removeItem = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/items/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchItems();
        showFeedback("Item deletado com sucesso", "success");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir item");
      }
    } catch (error: any) {
      showFeedback(error.message || "Erro ao excluir item", "error");
      console.error("Erro ao excluir item:", error);
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="container">
      <div className="header">
        <h1>CRUD React</h1>
        <button className="button-theme" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "Modo claro" : "Modo escuro"}
        </button>
      </div>
      {feedback && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}
      <div className="formulario">
        <input
          type="text"
          placeholder="Digite um item"
          value={pessoa}
          onChange={(e) => setPessoa(e.target.value)}
        />
        <button className="button-submit" onClick={handleSubmit}>
          {editId ? "Atualizar" : "Adicionar"} item
        </button>
      </div>
      <ul className="listaItens">
        {itens.map((item) => (
          <li className="item" key={item.id}>
            <span>{item.nome}</span>
            <div>
              <button className="edit" onClick={() => startEdit(item)}>
                Editar
              </button>
              <button className="delete" onClick={() => removeItem(item.id)}>
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;