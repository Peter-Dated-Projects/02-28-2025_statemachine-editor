"use client";
import styles from "./page.module.css";
import React, { useState, useCallback } from "react";
import SideBar from "./components/sidebar";
import CanvasWindow from "./components/canvas";
import { ReactFlowProvider } from "@xyflow/react";

import { LocalEdgeObject } from "./components/edges";

import { LocalNodeObject } from "./components/nodes";

// ------------------------------------------ //
// Interfaces

export interface StateManagerProps<T> {
  getter: T;
  setter: (value: T) => void;
  onChange?: (callback: (value: T) => void) => void;
}

export interface KeyNodePair {
  [key: string]: LocalNodeObject;
}

export interface GlobalNodeInformation {
  selectedNode: StateManagerProps<string | undefined>;
  hoveringNode: StateManagerProps<string | undefined>;
  activeNodes: StateManagerProps<Map<string, LocalNodeObject>>;
}

export interface GlobalEdgeInformation {
  selectedEdge: StateManagerProps<string | undefined>;
  hoveringEdge: StateManagerProps<string | undefined>;
  activeEdges: StateManagerProps<Map<string, LocalEdgeObject>>;
}

export interface SharedProgramData {
  editorWidth: StateManagerProps<number>;
  nodeInformation: GlobalNodeInformation;
  edgeInformation: GlobalEdgeInformation;
}

// ------------------------------------------ //
// Main Component
export default function Home() {
  // Sidebar and editor state
  const [sidebarWidth, setSidebarWidth] = useState(600);
  const [editorWidth, setEditorWidth] = useState(sidebarWidth - 60);

  // Handle sidebar resize
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      const startX = event.clientX;
      const startWidth = sidebarWidth;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const newWidth = Math.max(300, startWidth + moveEvent.clientX - startX);
        setSidebarWidth(newWidth);
        setEditorWidth(newWidth - 60);
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [sidebarWidth]
  );

  // Shared program state
  const [selectedNodeData, setSelectedNodeData] = useState<string | undefined>(undefined);
  const [hoveringNodeData, setHoveringNodeData] = useState<string | undefined>(undefined);
  const [activeNodesData, setActiveNodesData] = useState<Map<string, LocalNodeObject>>(new Map());
  const [selectedEdgeData, setSelectedEdgeData] = useState<string | undefined>(undefined);
  const [hoveringEdgeData, setHoveringEdgeData] = useState<string | undefined>(undefined);
  const [activeEdgesData, setActiveEdgesData] = useState<Map<string, LocalEdgeObject>>(new Map());
  const sharedData: SharedProgramData = {
    editorWidth: { getter: editorWidth, setter: setEditorWidth },
    nodeInformation: {
      selectedNode: { getter: selectedNodeData, setter: setSelectedNodeData },
      hoveringNode: { getter: hoveringNodeData, setter: setHoveringNodeData },
      activeNodes: { getter: activeNodesData, setter: setActiveNodesData },
    },
    edgeInformation: {
      selectedEdge: { getter: selectedEdgeData, setter: setSelectedEdgeData },
      hoveringEdge: { getter: hoveringEdgeData, setter: setHoveringEdgeData },
      activeEdges: { getter: activeEdgesData, setter: setActiveEdgesData },
    },
  };

  return (
    <div className={styles.page}>
      <div className={styles.container} style={{ display: "flex", height: "100vh" }}>
        {/* Sidebar */}
        <div
          style={{
            width: `${sidebarWidth}px`,
            height: "100vh",
            background: "#eee",
          }}
        >
          <SideBar props={sharedData} />
        </div>

        {/* Resize Handle */}
        <div onMouseDown={handleMouseDown} className={styles.resizeHandle} />

        {/* Canvas Window */}
        <div style={{ flexGrow: 1, height: "100vh" }}>
          <ReactFlowProvider>
            <CanvasWindow props={sharedData} />
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
}
