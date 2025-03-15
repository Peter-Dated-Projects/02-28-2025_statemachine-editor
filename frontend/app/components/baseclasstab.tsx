import styles from "./styles/baseclasstab.module.css";
import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

import { TabInfoProps } from "./sidebar";
import { DEFAULT_CLASS_TEXT } from "./tabinformation";

// ------------------------------------------ //
// base class input props
// ------------------------------------------ //
interface BaseClassTabProps {
  props: TabInfoProps;
}

// ------------------------------------------ //
// object
// ------------------------------------------ //
const BaseClassTab = ({ props }: BaseClassTabProps) => {
  const handleSave = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault();
      props.isSaved.setter(true);
      // send information to backend and retrieve active variables
      window.dispatchEvent(new CustomEvent("requestparsing"));
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleSave);

    return () => {
      window.removeEventListener("keydown", handleSave);
    };
  }, []);

  // return object
  return (
    <div className={styles.container}>
      <div className={styles["code-editor-container"]}>
        <Editor
          height="40vh"
          width={props.editorWidth.getter}
          language={props.baseClassLanguage.getter}
          value={props.baseClassCode.getter}
          defaultValue={DEFAULT_CLASS_TEXT}
          theme="vs-dark"
          onChange={(value) => {
            props.baseClassCode.setter(value || "");
            props.isSaved.setter(false);
          }}
          onMount={(editor, monaco) => {
            editor.focus();
            props.baseClassCode.setter(editor.getValue());
            window.dispatchEvent(new CustomEvent("requestparsing"));

            // loader.init().then((monacoInstance) => {
            //   monacoInstance.editor.defineTheme("nord", nordTheme);
            //   monacoInstance.editor.setTheme("nord");
            // });
          }}
        />
      </div>

      {/* secon section */}
      <div className={styles["nocode-container"]}>
        <div>
          <div>
            <h3>Class Variables</h3>
          </div>
          <div className={styles["class-variables-container"]}>
            {/* a section for class variables */}
            {props.baseClassVariables.getter.map(
              (variable: { name: string; value: string }, index: number) => (
                <div key={index} className={styles["class-variable"]}>
                  <div>
                    <span>self.{variable.name}</span> ={" "}
                    <span>{variable.value}</span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseClassTab;
