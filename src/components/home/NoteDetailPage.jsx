import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import DOMPurify from "dompurify";
import { IoChevronBackOutline } from "react-icons/io5";

// Register custom font sizes and background
const Size = Quill.import("attributors/style/size");
Size.whitelist = [
  "8px",
  "9px",
  "10px",
  "11px",
  "12px",
  "13px",
  "14px",
  "15px",
  "16px",
  "18px",
  "20px",
  "22px",
  "24px",
  "26px",
  "28px",
  "32px",
  "36px",
  "40px",
  "48px",
  "56px",
  "64px",
  "72px",
];
Quill.register(Size, true);

const Parchment = Quill.import("parchment");
const BackgroundClass = new Parchment.Attributor.Style(
  "background",
  "background-color",
  {
    scope: Parchment.Scope.INLINE,
  }
);
Quill.register(BackgroundClass, true);

export default function NoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const [note, setNote] = useState(null);
  const [noteHtml, setNoteHtml] = useState("");

  // Load note from localStorage
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
    const foundNote = savedNotes.find((n) => n.id === id);
    if (foundNote) {
      setNote(foundNote);
      setNoteHtml(foundNote.html);
    } else {
      navigate("/"); // Redirect if note not found
    }
  }, [id, navigate]);

  // Save note to localStorage on change
  const handleEditorChange = (value) => {
    setNoteHtml(value);
    const cleaned = value.replace(/<(.|\n)*?>/g, "").trim();
    if (cleaned) {
      const updatedNote = { ...note, html: value };
      const savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
      const updatedNotes = savedNotes.map((n) =>
        n.id === id ? updatedNote : n
      );
      localStorage.setItem("notes", JSON.stringify(updatedNotes));
    }
  };

  // Set default font size
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.format("size", "16px");
    }
  }, []);

  const modules = {
    toolbar: [
      [
        { color: [] },
        { background: [] },
        "bold",
        "italic",
        "underline",
        "strike",
        {
          size: [
            "8px",
            "9px",
            "10px",
            "11px",
            "12px",
            "13px",
            "14px",
            "15px",
            "16px",
            "18px",
            "20px",
            "22px",
            "24px",
            "26px",
            "28px",
            "32px",
            "36px",
            "40px",
            "48px",
            "56px",
            "64px",
            "72px",
          ],
        },
      ],
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

  return (
    <div className="page-content">
      <div className="md:w-[560px] min-h-[calc(100vh-20px)] px-[10px] pt-[10px] m-2 flex flex-col rounded-[7px] bg-white border border-[#E5E5E7]">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="text-sm text-[#000000] opacity-70 mb-4 flex justify-start items-center"
        >
          <IoChevronBackOutline />
          Home
        </button>

        {/* Editor */}
        {note && (
          <div className="mx-auto w-full custom_detail_page h-[calc(100vh-70px)]">
            <ReactQuill
              ref={quillRef}
              value={noteHtml}
              onChange={handleEditorChange}
              placeholder="Edit your note..."
              modules={modules}
              formats={formats}
              className="!rounded-[10px] h-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
