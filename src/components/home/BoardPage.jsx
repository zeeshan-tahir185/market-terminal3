import { useState, useRef, useEffect } from "react";
import { nanoid } from "nanoid";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import DOMPurify from "dompurify";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from "react-router-dom";

// Register custom font sizes
const Size = Quill.import("attributors/style/size");
Size.whitelist = [
  "8px", "9px", "10px", "11px", "12px", "13px", "14px", "15px",
  "16px", "18px", "20px", "22px", "24px", "26px", "28px", "32px",
  "36px", "40px", "48px", "56px", "64px", "72px"
];
Quill.register(Size, true);

// Ensure background format is registered
const Parchment = Quill.import("parchment");
const BackgroundClass = new Parchment.Attributor.Style("background", "background-color", {
  scope: Parchment.Scope.INLINE,
});
Quill.register(BackgroundClass, true);

// Sortable Note component
const SortableNote = ({ note }) => {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: note.id,
  });
  const clickTimeout = useRef(null);
  const mouseDownPos = useRef(null);
  const isDraggingRef = useRef(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1, // Hide original during drag
  };

  const handleMouseDown = (e) => {
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
  };

  const handleMouseUp = (e) => {
    if (isDraggingRef.current) return;

    const mouseMoveDistance = mouseDownPos.current
      ? Math.sqrt(
          Math.pow(e.clientX - mouseDownPos.current.x, 2) +
          Math.pow(e.clientY - mouseDownPos.current.y, 2)
        )
      : 0;

    if (mouseMoveDistance < 5) {
      clearTimeout(clickTimeout.current);
      navigate(`/note/${note.id}`);
    }
  };

  const handleDragStart = () => {
    isDraggingRef.current = true;
    clearTimeout(clickTimeout.current); 
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="notes_custom_shadow rounded-xl p-[10px] shadow-sm bg-white border border-[#E3E3E880] flex flex-col gap-[25px] "
    >
      <div
        className="text-xs font-medium custom_letter_space"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.html) }}
      />
    </div>
  );
};

// Drag Overlay Note component (solid, lifted version)
const OverlayNote = ({ note }) => {
  return (
    <div className="notes_custom_shadow rounded-xl p-[10px] shadow-lg bg-white border border-[#E3E3E880] flex flex-col gap-[25px] transform scale-105">
      <div
        className="text-xs font-medium custom_letter_space"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.html) }}
      />
    </div>
  );
};

export default function BoardPage() {
  const [notes, setNotes] = useState(() => {
    return JSON.parse(localStorage.getItem("notes") || "[]");
  });
  const [query, setQuery] = useState("");
  const [newNote, setNewNote] = useState('<p style="font-size: 16px"><br></p>');
  const [showToolbar, setShowToolbar] = useState(false);
  const [editorExpanded, setEditorExpanded] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const quillRef = useRef(null);
  const editorContainerRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require some movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  // Set default font size to 16px when editor mounts
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.format("size", "16px");
    }
  }, [newNote]);

  // Remove auto-focus on mount
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      editor.blur();
      setEditorExpanded(false);
    }
  }, []);

  // Save note on click outside editor
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        editorContainerRef.current &&
        !editorContainerRef.current.contains(event.target)
      ) {
        const cleaned = newNote.replace(/<(.|\n)*?>/g, "").trim();
        if (cleaned.length > 0) {
          addNote();
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [newNote, notes]);

  // Attach focus/blur listeners on actual editable div (.ql-editor)
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const editorDom = editor.root;

      const handleFocus = () => {
        setEditorExpanded(true);
      };

      const handleBlur = () => {
        const cleaned = newNote.replace(/<(.|\n)*?>/g, "").trim();
        if (!cleaned) {
          setEditorExpanded(false);
        }
      };

      editorDom.addEventListener("focus", handleFocus);
      editorDom.addEventListener("blur", handleBlur);

      return () => {
        editorDom.removeEventListener("focus", handleFocus);
        editorDom.removeEventListener("blur", handleBlur);
      };
    }
  }, [newNote]);

  const addNote = () => {
    const cleaned = newNote.replace(/<(.|\n)*?>/g, "").trim();
    if (!cleaned) return;

    const note = {
      id: nanoid(),
      html: newNote,
      createdAt: Date.now(),
    };
    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
    setNewNote('<p style="font-size: 16px"><br></p>');
    setEditorExpanded(false);
  };

  const handleEditorChange = (value) => {
    const quill = quillRef.current.getEditor();
    quill.format("size", "16px");
    setNewNote(value);
    if (value !== '<p style="font-size: 16px"><br></p>') {
      setShowToolbar(true);
    }
  };

  const handleDragStart = (event) => {
    setActiveNote(notes.find((n) => n.id === event.active.id));
  };

  const handleDragEnd = (event) => {
    setActiveNote(null);
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = notes.findIndex((n) => n.id === active.id);
      const newIndex = notes.findIndex((n) => n.id === over.id);
      setNotes(arrayMove(notes, oldIndex, newIndex));
    }
  };

  const modules = {
    toolbar: [
      [{ color: [] }, { background: [] }, "bold", "italic", "underline", "strike", {
        size: [
          "8px", "9px", "10px", "11px", "12px", "13px", "14px", "15px",
          "16px", "18px", "20px", "22px", "24px", "26px", "28px", "32px",
          "36px", "40px", "48px", "56px", "64px", "72px",
        ],
      }],
      [{ align: "" }, { align: "center" }, { align: "right" }],
    ],
  };

  const formats = [
    "color",
    "background",
    "bold",
    "italic",
    "underline",
    "strike",
    "size",
    "align",
  ];

  const filteredNotes = notes.filter((n) =>
    n.html.toLowerCase().includes(query.toLowerCase())
  );

 return (
    <div className="min-h-[736px] p-[14px] flex flex-col gap-[21px] ">
      {/* Search box */}
      <div className="flex items-center gap-[5px] text-[#000000] text-[13px]">
        <img src="/images/search.png" alt="" />
        <input
          type="text"
          placeholder="Search note or keyword...."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full outline-none placeholder-[#000000] opacity-[70%]"
        />
      </div>

      {/* Editor */}
      <div
        ref={editorContainerRef}
        className="mx-auto w-full md:w-[359px] border border-[#E3E3E880] textarea_box_shadow rounded-[10px]"
      >
        <ReactQuill
          ref={quillRef}
          value={newNote}
          onChange={handleEditorChange}
          placeholder="📝 Write new journal..."
          modules={modules}
          formats={formats}
          className={`!rounded-[10px] ${showToolbar ? "" : "toolbar-hidden"} ${editorExpanded ? "expanded" : ""}`}
        />
      </div>

      {/* Notes list with drag-and-drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredNotes.map((n) => n.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[14px]">
            {filteredNotes.map((note) => (
              <SortableNote key={note.id} note={note} />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeNote ? <OverlayNote note={activeNote} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
);
}