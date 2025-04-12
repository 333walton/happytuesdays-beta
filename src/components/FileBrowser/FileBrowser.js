import React from "react";
import Window from "../tools/Window"; // your custom wrapper
import { camera16 } from "../../icons"; // replace with your actual icon

const pokedexData = [
  { type: "🌿", name: "Bulbasaur", level: 64 },
  { type: "🔥", name: "Charizard", level: 209 },
  { type: "⚡", name: "Pikachu", level: 82 },
];

const FileBrowser = (props) => {
  return (
    <Window
      {...props}
      title="Pokedex.exe"
      icon={camera16}
      resizable={false}
      initialWidth={260}
      initialHeight={200}
      style={{ padding: 8 }}
    >
      <table style={{ width: "100%", fontSize: "14px", borderSpacing: 4 }}>
        <thead>
          <tr>
            <th align="left">Type</th>
            <th align="left">Name</th>
            <th align="left">Level</th>
          </tr>
        </thead>
        <tbody>
          {pokedexData.map((entry, index) => (
            <tr key={index}>
              <td>{entry.type}</td>
              <td>{entry.name}</td>
              <td>{entry.level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Window>
  );
};

export default FileBrowser;
