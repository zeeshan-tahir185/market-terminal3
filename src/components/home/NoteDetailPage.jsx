import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import DOMPurify from "dompurify";
import { IoChevronBackOutline } from "react-icons/io5";

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
  const location = useLocation();
  const [note, setNote] = useState(null);
  const [noteHtml, setNoteHtml] = useState("");
  const quillRef = useRef(null);
  const [animationClass, setAnimationClass] = useState("");

  // Load the note from localStorage
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
    const foundNote = savedNotes.find((n) => n.id === id);
    if (foundNote) {
      setNote(foundNote);
      setNoteHtml(foundNote.html);
    } else {
      navigate("/"); // Redirect if the note is not found
    }
  }, [id, navigate]);

  // Save the note to localStorage on change
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
let navigateToHome=()=>{
  setAnimationClass("detail-page-exit");
          setTimeout(() => {
            navigate("/");
          }, 300);
}
  // Detect page transitions and apply the animation
  useEffect(() => {
    // Only apply animation when navigating to the note detail page
    if (location.pathname.includes(id)) {
      setAnimationClass("detail-page-enter");
    } else {
      setAnimationClass("detail-page-exit");
    }
  }, [location, id]);

  console.log("Animation Class: ", animationClass);

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
    <div
      className={`z- min-h-[calc(100vh-20px)] flex flex-col rounded-[7px] px-[10px] pt-[10px] ${animationClass}`}
    >
      {/* Back Button */}
      <button
        onClick={() =>navigateToHome()}
        className="text-sm text-[#000000] opacity-70 mb-4 flex justify-start items-center"
      >
        <IoChevronBackOutline />
        Home
      </button>

      {/* Editor */}
      {note && (
        <div className="mx-auto w-full custom_detail_page h-[calc(100vh-70px)] detail_custom_edditor">
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
  );
}
