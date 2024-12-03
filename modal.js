const colors = {
  BLUE: "#3498db",
  GREEN: "#2ecc71",
  RED: "#e74c3c",
  GOLD: "#FFD700",
  ORANGE: "#e67e22",
  PURPLE: "#9b59b6",
};

export class ModalManager {
  constructor() {
    this.modalElement = document.getElementById("pause-modal");
    this.contentElement = this.modalElement.querySelector(".pause-content");

    this.modalTypes = {
      store: {
        title: "STORE",
        titleColor: colors.PURPLE,
        message: "Press P to continue",
      },
      pause: {
        title: "PAUSED",
        titleColor: colors.BLUE,
        message: "Press P to resume",
      },
      // Add more modal types here as needed
      gameOver: {
        title: "GAME OVER",
        titleColor: colors.RED,
        message: "Press R to restart",
      },
    };
  }

  show(type) {
    if (!this.modalTypes[type]) {
      console.error(`Modal type "${type}" not found`);
      return;
    }

    const modalContent = this.modalTypes[type];
    this.contentElement.innerHTML = `
            <h2 style="color: ${modalContent.titleColor}">${modalContent.title}</h2>
            <p>${modalContent.message}</p>
        `;
    this.modalElement.style.display = "block";
  }

  hide() {
    this.modalElement.style.display = "none";
  }

  // Method to add custom modal types
  addModalType(type, content) {
    this.modalTypes[type] = content;
  }

  // Method to update existing modal content
  updateModalContent(type, content) {
    if (this.modalTypes[type]) {
      this.modalTypes[type] = { ...this.modalTypes[type], ...content };
    }
  }
}
