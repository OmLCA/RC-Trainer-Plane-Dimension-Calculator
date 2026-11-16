# AERO DESIGN STUDIO – RC TRAINER AIRCRAFT DESIGNER

A professional preliminary engineering design web application for sizing and generating technical blueprint drawings of RC trainer aircraft.

---

## 🚀 HOW TO RUN LOCALLY ON WINDOWS

You have **two easy ways** to run this application:

### METHOD 1: Instant Launch (Zero Installation Required)
> **Recommended if you are a beginner or want to use the app immediately without installing Node.js:**

1. Open your Windows File Explorer.
2. Navigate to your project folder:
   ```
   C:\Users\User\Downloads\RCPlaneCalc
   ```
3. **Double-click `standalone.html`** (or right-click -> **Open with** -> **Google Chrome** / **Microsoft Edge**).
4. The application will start immediately in your browser with full 3D visualization, dynamic dimension calculations, SVG drawings, unit switching, and PDF export!

---

### METHOD 2: Standard Vite + React + TypeScript Development Server
> **If you have Node.js installed and want to run the modular development build:**

1. Open **Command Prompt** (`cmd`) or **PowerShell** on Windows.
2. Navigate to the project directory:
   ```powershell
   cd C:\Users\User\Downloads\RCPlaneCalc
   ```
3. Install the project dependencies:
   ```powershell
   npm install
   ```
4. Start the local Vite development server:
   ```powershell
   npm run dev
   ```
5. Your browser will automatically open (or visit `http://localhost:3000` or `http://localhost:5173`).

---

## ✈️ FEATURES & ARCHITECTURE

### 1. Global Unit Selection (`cm` & `in`)
- Centralized unit selector in the top navigation bar.
- Switch between **Centimetres (`cm`)** and **Inches (`in`)** at any moment without resetting your design geometry.
- Stored internally in standardized **Millimeters (`mm`)** for numerical stability ($1\text{ in} = 25.4\text{ mm}$, $1\text{ cm} = 10\text{ mm}$).
- All SVG technical dimension lines, measurement arrows, and export sheets update instantly.

### 2. Preliminary Aeronautical Sizing Engine
Uses verified RC trainer design ratios and formulas:
- **Wing Area ($S$)**: $S = b \times c_{mean} = b^2 / AR$
- **Wing Aspect Ratio ($AR$)**: Configurable (default 6.0 for gentle stall behavior).
- **Mean Aerodynamic Chord ($MAC$)**: Calculated for rectangular or trapezoidal tapered wings with center of gravity ($CG$) at 28–30% MAC.
- **Horizontal Tail Volume Coefficient ($V_h$)**:
  $$V_h = \frac{S_h \cdot L_{tail}}{S_w \cdot c_{mac}}$$
  Targeted at 0.55–0.75 for positive pitch stability.
- **Vertical Tail Volume Coefficient ($V_v$)**:
  $$V_v = \frac{S_v \cdot L_{tail}}{S_w \cdot b}$$
  Targeted at 0.035–0.050 for yaw damping and Dutch roll suppression.
- **Fuselage Length**: 70%–80% of wingspan with built-in $2.0^\circ$ down-thrust and $1.5^\circ$ right-thrust.

### 3. Dynamic Technical SVG Drawings
- Real engineering drawing aesthetic (Navy Blueprint mode or Light CAD Drafting mode).
- Dimension lines with extension lines, offset gaps, measurement arrows, and unit badges.
- **Main Wing**: Top view planform, Clark Y / NACA 2412 / NACA 4412 airfoil section, and Front dihedral angle view.
- **Horizontal Stabilizer**: Planform with separate elevator section and rudder swing clearance cutout.
- **Vertical Stabilizer**: Side elevation with separate rudder section and dorsal fin.
- **Fuselage**: Top view planform and side elevation with wing seat, engine firewall, and landing gear.
- **Control Surfaces**: Dedicated individual drawings for ailerons, elevator, and rudder with deflection throw recommendations.

### 4. Reference-Assisted Geometric Synthesis
- Upload reference images for Fuselage Top, Fuselage Side, Wing, or Empennage.
- Calibrate real-world scale: click two points on the image and enter the known length in `cm` or `in`.
- Synthesize **new, original** parametric components inspired by the reference proportions while ensuring full aerodynamic compatibility with the rest of the plane.

### 5. Interactive 3D Visualization
- Built with **Three.js**.
- Live 3D model of your RC trainer that updates in real-time as wingspan or ratios change.
- Click and drag to orbit, scroll wheel to zoom.

### 6. Aerospace Manufacturing Blueprint Sheet
- Master general arrangement drawing sheet with Title Block, drawing numbers, revisions, specification schedules, and all 7 views.
- Interactive pan and zoom.

### 7. Multi-Format Exports
- **PDF Blueprint**: High-resolution specification sheet ready to print.
- **SVG Vector Files**: Direct vector downloads for CAD software or laser cutters.
- **CSV Data Schedule**: Complete table of dimensions, areas, and moment arms.
- **JSON Project Save & Load**: Save and resume your project anytime.
