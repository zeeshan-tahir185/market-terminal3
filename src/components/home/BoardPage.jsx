// src/pages/BoardPage.jsx
import { useState } from "react";
import { nanoid } from "nanoid";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function BoardPage() {
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState("");
  const [newNote, setNewNote] = useState("");

  const addNote = () => {
    if (!newNote.trim() || newNote === "<p><br></p>") return;
    const note = {
      id: nanoid(),
      html: newNote,
      createdAt: Date.now(),
    };
    setNotes([note, ...notes]);
    setNewNote("");
  };

  const filteredNotes = notes.filter((n) =>
    n.html.toLowerCase().includes(query.toLowerCase())
  );

  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      [{ align: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ color: [] }],
    ],
  };

  return (
    <div className="md:w-[560px] min-h-[736px] p-5 m-2 flex flex-col gap-[21px] rounded-[7px] bg-white border border-[#E5E5E7]">
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
      <div className="mx-auto w-full md:w-[359px] border border-[#E3E3E880] textarea_box_shadow rounded-[10px]">
        <ReactQuill
          value={newNote}
          onChange={setNewNote}
          placeholder="📝  Write new journal..."
          modules={modules}
          className="rounded-[10px]"
        />
        <div className="flex justify-end p-2">
          <button
            onClick={addNote}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm"
          >
            Save
          </button>
        </div>
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
              dangerouslySetInnerHTML={{ __html: note.html }}
            />
          </div>
        ))}

        {/* Dummy notes if none */}
        {filteredNotes.length === 0 && (
          <>
            <div className="notes_custom_shadow rounded-xl p-[10px] shadow-sm bg-white border border-[#E3E3E880] flex flex-col gap-[25px]">
              <h2 className="font-semibold text-xs">What is Lorem Ipsum?</h2>
              <p className="text-xs font-medium custom_letter_space">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry...
              </p>
            </div>
            <div className="notes_custom_shadow rounded-xl p-[10px] shadow-sm bg-white border border-[#E3E3E880] flex flex-col gap-[25px]">
              <h2 className="font-semibold text-xs">What is Lorem Ipsum?</h2>
              <p className="text-xs font-medium custom_letter_space">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry...
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
