// Hero section specific JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Typing effect for hero title
  const typed = new Typed(".typed-text", {
    strings: ["Machine Learning^1000", "Deep Learning^1000", "AI Systems^1000"],
    typeSpeed: 80,
    backSpeed: 40,
    loop: true,
    showCursor: false,
  });

  // ML Model Animation
  const mlModel = document.getElementById("mlModel");
  if (mlModel) {
    initMLModelAnimation();
  }
});

function initMLModelAnimation() {
  const modelContainer = document.querySelector(".model-container");

  // Define node positions
  const nodes = [
    // Input layer
    { id: "i1", x: 50, y: 75, type: "input", label: "I1" },
    { id: "i2", x: 50, y: 150, type: "input", label: "I2" },
    { id: "i3", x: 50, y: 225, type: "input", label: "I3" },
    // Hidden layer
    { id: "h1", x: 200, y: 50, type: "hidden", label: "H1" },
    { id: "h2", x: 200, y: 125, type: "hidden", label: "H2" },
    { id: "h3", x: 200, y: 200, type: "hidden", label: "H3" },
    { id: "h4", x: 200, y: 275, type: "hidden", label: "H4" },
    // Output layer
    { id: "o1", x: 350, y: 100, type: "output", label: "O1" },
    { id: "o2", x: 350, y: 200, type: "output", label: "O2" },
  ];

  // Define connections
  const connections = [
    // Input to Hidden
    { from: "i1", to: "h1" },
    { from: "i1", to: "h2" },
    { from: "i1", to: "h3" },
    { from: "i2", to: "h2" },
    { from: "i2", to: "h3" },
    { from: "i2", to: "h4" },
    { from: "i3", to: "h2" },
    { from: "i3", to: "h3" },
    { from: "i3", to: "h4" },
    // Hidden to Output
    { from: "h1", to: "o1" },
    { from: "h2", to: "o1" },
    { from: "h2", to: "o2" },
    { from: "h3", to: "o1" },
    { from: "h3", to: "o2" },
    { from: "h4", to: "o2" },
  ];

  // Create nodes
  nodes.forEach((node) => {
    const nodeElement = document.createElement("div");
    nodeElement.className = `model-node ${node.type}`;
    nodeElement.id = node.id;
    nodeElement.style.left = `${node.x}px`;
    nodeElement.style.top = `${node.y}px`;
    nodeElement.textContent = node.label;
    modelContainer.appendChild(nodeElement);
  });

  // Create connections
  connections.forEach((conn) => {
    const fromNode = nodes.find((n) => n.id === conn.from);
    const toNode = nodes.find((n) => n.id === conn.to);
    const connection = document.createElement("div");
    connection.className = "connection";

    // Calculate angle and length for connection
    const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
    const distance = Math.sqrt(
      Math.pow(toNode.x - fromNode.x, 2) + Math.pow(toNode.y - fromNode.y, 2)
    );

    connection.style.width = `${distance}px`;
    connection.style.left = `${fromNode.x + 15}px`;
    connection.style.top = `${fromNode.y + 15}px`;
    connection.style.transform = `rotate(${angle}rad)`;
    modelContainer.appendChild(connection);
  });

  // Create data packets
  const packets = [];
  const packetPaths = [
    // Path 1: i1 -> h2 -> o1
    [
      { nodeId: "i1", duration: 1000 },
      { nodeId: "h2", duration: 1000 },
      { nodeId: "o1", duration: 1000 },
    ],
    // Path 2: i2 -> h3 -> o2
    [
      { nodeId: "i2", duration: 1200 },
      { nodeId: "h3", duration: 1200 },
      { nodeId: "o2", duration: 1200 },
    ],
    // Path 3: i3 -> h4 -> o2
    [
      { nodeId: "i3", duration: 1400 },
      { nodeId: "h4", duration: 1400 },
      { nodeId: "o2", duration: 1400 },
    ],
    // Path 4: i1 -> h1 -> o1
    [
      { nodeId: "i1", duration: 1600 },
      { nodeId: "h1", duration: 1600 },
      { nodeId: "o1", duration: 1600 },
    ],
  ];

  // Create packets for each path
  packetPaths.forEach((path, pathIndex) => {
    const packet = document.createElement("div");
    packet.className = "data-packet";
    modelContainer.appendChild(packet);
    packets.push({
      element: packet,
      path: path,
      currentStep: 0,
      progress: 0,
      startTime: Date.now() + pathIndex * 400, // Stagger start times
    });
  });

  // Animate packets
  function animatePackets() {
    const currentTime = Date.now();
    packets.forEach((packet) => {
      if (currentTime < packet.startTime) return;

      const currentStep = packet.path[packet.currentStep];
      const nextStep = packet.path[packet.currentStep + 1];

      if (!nextStep) {
        // Reset to beginning of path
        packet.currentStep = 0;
        packet.progress = 0;
        return;
      }

      // Calculate progress based on time
      const elapsed = currentTime - packet.startTime;
      const stepDuration = currentStep.duration;
      const totalElapsedForStep =
        elapsed % packet.path.reduce((sum, step) => sum + step.duration, 0);

      // Find current step based on elapsed time
      let accumulatedTime = 0;
      for (let i = 0; i < packet.path.length - 1; i++) {
        accumulatedTime += packet.path[i].duration;
        if (totalElapsedForStep < accumulatedTime) {
          packet.currentStep = i;
          packet.progress =
            (totalElapsedForStep -
              (accumulatedTime - packet.path[i].duration)) /
            packet.path[i].duration;
          break;
        }
      }

      // Get current and next nodes
      const fromNode = nodes.find(
        (n) => n.id === packet.path[packet.currentStep].nodeId
      );
      const toNode = nodes.find(
        (n) => n.id === packet.path[packet.currentStep + 1].nodeId
      );

      // Calculate position
      const x = fromNode.x + 15 + (toNode.x - fromNode.x) * packet.progress - 5;
      const y = fromNode.y + 15 + (toNode.y - fromNode.y) * packet.progress - 5;
      packet.element.style.left = `${x}px`;
      packet.element.style.top = `${y}px`;
    });
    requestAnimationFrame(animatePackets);
  }
  animatePackets();

  // Add layer labels
  const labels = [
    { text: "Input", x: 50, y: 20 },
    { text: "Hidden", x: 200, y: 20 },
    { text: "Output", x: 350, y: 20 },
  ];

  labels.forEach((label) => {
    const labelElement = document.createElement("div");
    labelElement.className = "model-label";
    labelElement.textContent = label.text;
    labelElement.style.left = `${label.x}px`;
    labelElement.style.top = `${label.y}px`;
    labelElement.style.transform = "translateX(-50%)";
    modelContainer.appendChild(labelElement);
  });
}
