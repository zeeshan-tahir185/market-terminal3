import { useState, useRef, useEffect } from "react";
import { nanoid } from "nanoid";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import DOMPurify from "dompurify";

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

export default function BoardPage() {
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState("");
  const [newNote, setNewNote] = useState('<p style="font-size: 16px"><br></p>');
  const [showToolbar, setShowToolbar] = useState(false);
  const [editorExpanded, setEditorExpanded] = useState(false); // collapsed/expanded state
  const quillRef = useRef(null);
  const editorContainerRef = useRef(null);

  // Set default font size to 16px when editor mounts
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.format("size", "16px");  // Set font size to 16px on mount
    }
  }, [newNote]);

  // Remove auto-focus on mount
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      editor.blur(); // force remove focus on mount
      setEditorExpanded(false); // collapsed state on load
    }
  }, []);

  // Save note on click outside editor
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        editorContainerRef.current &&
        !editorContainerRef.current.contains(event.target)
      ) {
        // click editor ke bahr hua
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
      const editorDom = editor.root; // this is the .ql-editor div

      const handleFocus = () => {
        setEditorExpanded(true); // expand editor
      };

      const handleBlur = () => {
        const cleaned = newNote.replace(/<(.|\n)*?>/g, "").trim();
        if (!cleaned) {
          setEditorExpanded(false); // collapse back only if empty
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
    if (!cleaned) return; // empty mat save karo

    const note = {
      id: nanoid(),
      html: newNote,
      createdAt: Date.now(),
    };
    setNotes([note, ...notes]);

    // Reset the new note to have 16px font size
    setNewNote('<p style="font-size: 16px"><br></p>');
    setEditorExpanded(false); // collapse after saving
  };


  const handleEditorChange = (value) => {
    const quill = quillRef.current.getEditor();
    quill.format("size", "16px");  // Always set font size to 16px while typing
    setNewNote(value);
    if (value !== '<p style="font-size: 16px"><br></p>') {
      setShowToolbar(true);
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
      },],
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
    <div className="md:w-[560px] min-h-[736px] p-5 m-2 flex flex-col gap-[21px] rounded-[7px] bg-white border border-[#E5E5E7]">
      {/* Search box */}
      <div className="flex items-center gap-[5px] text-[#000000] text-[13px] ">
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
        className="mx-auto w-full md:w-[359px] border border-[#E3E3E880] textarea_box_shadow rounded-[17px]"
      >
        <ReactQuill
          ref={quillRef}
          value={newNote}
          onChange={handleEditorChange}
          placeholder="📝 Write new journal..."
          modules={modules}
          formats={formats}
          className={`!rounded-[17px] ${showToolbar ? "" : "toolbar-hidden"
            } ${editorExpanded ? "expanded" : ""}`}
        />
      </div>

      {/* Notes list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[14px]">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="notes_custom_shadow rounded-xl p-[10px] shadow-sm bg-white border border-[#E3E3E880] flex flex-col gap-[25px]"
          >
            <div
              className="text-xs font-medium custom_letter_space"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.html) }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
