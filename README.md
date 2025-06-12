# Ambica Packaging Inventory Manager

This is a lightweight, offline desktop application built using Electron, Node.js, and SQLite. It is designed to manage and track packaging materials, specifically reels such as Craft Paper and Duplex Boards. The application provides a responsive user interface and persistent local storage, making it suitable for real-world production use.

---

## Project Overview

The Ambica Packaging Inventory Manager was created to provide a user-friendly, efficient solution for managing physical inventory in a packaging environment. The app supports core features such as data entry, dynamic sorting, and field-level visibility control, all while operating entirely offline.

This application was developed in a virtualized macOS environment running on Windows ARM. Setting up Node.js and Electron in this environment required significant configuration effort, showcasing a strong understanding of cross-platform development and toolchain management.

---

## Technologies Used

- **Electron** – For building the cross-platform desktop interface
- **Node.js** – Backend logic and IPC (inter-process communication)
- **SQLite (via sql.js)** – Embedded database compiled to WebAssembly for offline use
- **HTML/CSS** – Interface layout and styling
- **JavaScript** – Form handling, IPC communication, and data manipulation

---

## Features

- Add and manage reels with attributes such as Date, Company, Size, GSM, BF, Weight, Amount, and Type
- Live sorting via dropdown (Date, Company Name, or Type)
- Selectable column visibility using a checkbox menu
- Manual refresh to update the data view
- Fully offline operation using a local `.sqlite` file

---

## File Structure

