import React, {useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import "./Dropzone.css";

function Dropzone({ children, onDropFiles }) {
  const onDrop = useCallback(acceptedFiles => {
    onDropFiles && onDropFiles(acceptedFiles);
  }, [onDropFiles]);
  const {getRootProps, isDragActive} = useDropzone({onDrop});

  return (
    <div className={`drop-overlay ${isDragActive ? "dropping" : ""}`} {...getRootProps()}>
      {children}
    </div>
  );
};

export default Dropzone;
