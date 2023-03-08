// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';

const ModalNotes = ({ notes }) => {
  return (
    <div className="mt-6">
      <h1 className="font-red-hat-text text-sm font-semibold text-white">
        Note
      </h1>
      <div className="list-disc text-white text-opacity-80 space-y-2 pt-2">
        {notes.map((note) => {
          return <ModalNote key={note} note={note} />;
        })}
      </div>
    </div>
  );
};

ModalNotes.propTypes = {
  notes: PropTypes.arrayOf(PropTypes.string)
};

const ModalNote = ({ note }) => {
  return (
    <h2 className="font-red-hat-text leading-5.5 text-sm tracking-tight">{note}</h2>
  );
};

ModalNote.propTypes = {
  note: PropTypes.string
};

export default ModalNotes;
