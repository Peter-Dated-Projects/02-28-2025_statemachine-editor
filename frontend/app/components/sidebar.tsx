"use client";

import React, { useState, useEffect, useMemo } from "react";
import styles from "./styles/sidebar.module.css";
import { StateManagerProps, SharedProgramData } from "../page";
import { BACKEND_IP } from "../globals";
import BaseClassTab from "./baseclasstab";

interface SideBarProps {
  props: SharedProgramData;
}

interface BackendQueryVariable {
  name: string;
  value: string;
}

export interface TabInfoProps {
  editorWidth: StateManagerProps<number>;
  baseClassCode: StateManagerProps<string>;
  baseClassLanguage: StateManagerProps<string>;
  baseClassVariables: StateManagerProps<BackendQueryVariable[]>;
}

const SideBar: React.FC<SideBarProps> = ({ props }) => {
  const [baseClassCode, setBaseClassCode] = useState("");
  const [baseClassLanguage, setBaseClassLanguage] = useState("python");
  const [baseClassVariables, setBaseClassVariables] = useState<BackendQueryVariable[]>([]);
  const [readyToParse, setReadyToParse] = useState(false);

  interface NodeData {
    id: string;
    type: string;
  }
  const [nodeData, setNodeData] = useState<NodeData | null>(null);

  // create nodedata effect manager
  useEffect(() => {
    // get node information
    const nodeInfo = props.nodeInformation.selectedNode.getter
      ? props.nodeInformation.activeNodes.getter.get(
          props.nodeInformation.selectedNode.getter || ""
        )
      : null;
    if (nodeInfo) {
      setNodeData({ id: nodeInfo.id, type: nodeInfo.type });
    } else {
      setNodeData(null);
    }
  }, [props.nodeInformation.activeNodes.getter, props.nodeInformation.selectedNode.getter]);

  // Memoize the tab information
  const tabInfo = useMemo(
    () => ({
      editorWidth: props.editorWidth,
      baseClassCode: { getter: baseClassCode, setter: setBaseClassCode },
      baseClassLanguage: {
        getter: baseClassLanguage,
        setter: setBaseClassLanguage,
      },
      baseClassVariables: {
        getter: baseClassVariables,
        setter: setBaseClassVariables,
      },
    }),
    [baseClassCode, baseClassLanguage, baseClassVariables, props.editorWidth]
  );

  // Log the base class code
  useEffect(() => {
    console.log("Base Class Code:", tabInfo.baseClassCode.getter);
  }, [tabInfo.baseClassCode.getter]);

  // Parse the base class code
  useEffect(() => {
    const handleRequestParsing = () => setReadyToParse(true);
    window.addEventListener("requestparsing", handleRequestParsing);
    return () => window.removeEventListener("requestparsing", handleRequestParsing);
  }, []);

  // Send the base class code to the backend for parsing
  useEffect(() => {
    if (!readyToParse) return;
    fetch(`${BACKEND_IP}/api/code-parser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: tabInfo.baseClassCode.getter,
        language: tabInfo.baseClassLanguage.getter,
      }),
    })
      .then((res) => res.json())
      .then((data) => tabInfo.baseClassVariables.setter(data.variables))
      .catch(console.error);
    setReadyToParse(false);
  }, [readyToParse, tabInfo]);

  // Generate the base class code
  return (
    <div className={styles.container}>
      <div className={styles.nodeInfo}>
        <h3>Current Node:</h3>
        <div className={styles.currentNodeDisplay}>
          {nodeData ? `${nodeData.id} — ${nodeData.type}` : "No Selected Node"}
        </div>
      </div>
      <div className={styles.editorTab}>
        <BaseClassTab key="baseClassTab" props={tabInfo} />
      </div>
    </div>
  );
};

export default SideBar;
