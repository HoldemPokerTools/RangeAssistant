import React, {useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import {
  FileAddFilled,
} from "@ant-design/icons";
import styles from "./Dropzone.module.css";

function Dropzone({ children }) {
  const onDrop = useCallback(acceptedFiles => {
    acceptedFiles.forEach(f => window.Ranges.importRangeFile(f.path));
  }, [])
  const {getRootProps, isDragActive} = useDropzone({onDrop})

  return (
    <div className={styles.root} {...getRootProps()}>
      {children}
      {
        isDragActive && <div className={styles.overlay}>
          <FileAddFilled style={{fontSize: 52, color: '#55c123'}}/>
          <h3 className={styles.overlayText}>Drop your range file here</h3>
        </div>
      }
    </div>
  )
}

export default Dropzone;
