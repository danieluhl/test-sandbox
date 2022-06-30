import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

// perform math for WCAG2 magic

// red, green, and blue coefficients
// https://en.wikipedia.org/wiki/Rec._709#Luma_coefficients
// https://en.wikipedia.org/wiki/Relative_luminance
const RGB_COEFFICIENTS = [0.2126, 0.7152, 0.0722];
const LOW_GAMMA_THRESHOLD = 0.03928;
// low-gamma adjust coefficient
const LOW_GAMMA_ADJUSTMENT_COEFFICIENT = 12.92;
// High gamma adjustment
// https://en.wikipedia.org/wiki/SRGB#The_reverse_transformation
const highGammaAdjust = (val) => Math.pow((val + 0.055) / 1.055, 2.4);

// Scale to the CIE colorspace
// https://en.wikipedia.org/wiki/CIE_1931_color_space
const getCIEColor = (value) => value / 255;
const gammaAdjust = (value) =>
  value <= LOW_GAMMA_THRESHOLD
    ? value / LOW_GAMMA_ADJUSTMENT_COEFFICIENT
    : highGammaAdjust(value);
const applyCoefficients = (value, i) => value * RGB_COEFFICIENTS[i];
const calculateLuminanceRatio = (value, i) =>
  applyCoefficients(gammaAdjust(getCIEColor(value)), i);

const getRelativeLuminance = (rgb) =>
  rgb.map(calculateLuminanceRatio).reduce((a, b) => a + b);

const getContrastRatio = (rgb1, rgb2) => {
  const rl1 = getRelativeLuminance(rgb1);
  const rl2 = getRelativeLuminance(rgb2);
  const l1 = Math.max(rl1, rl2);
  const l2 = Math.min(rl1, rl2);
  return (l1 + 0.05) / (l2 + 0.05);
};

const isAACompliant = (ratio) => ratio >= 4.5;
const isAAACompliant = (ratio) => ratio >= 7;

const extractRGB = (rgbString) =>
  rgbString
    .match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
    .slice(1)
    .map((rgb) => parseInt(rgb));

const setTextColors = ({ txtColor, bgColor }) => {
  const txtColorElt = document.querySelector(".txtColor");
  const bgColorElt = document.querySelector(".bgColor");
  const headingElt = document.querySelector(".heading");

  const notCompliant = document.querySelector(".notCompliant");
  const aaCompliant = document.querySelector(".aaCompliant");
  const notAACompliant = document.querySelector(".notAACompliant");
  const aaaCompliant = document.querySelector(".aaaCompliant");
  const notAAACompliant = document.querySelector(".notAAACompliant");
  const complianceNumber = document.querySelector(".complianceNumber");

  headingElt.style.backgroundColor =
    bgColor || headingElt.style.backgroundColor || "#fff";
  headingElt.style.color = txtColor || headingElt.style.color || "#000";
  const ratio = getContrastRatio(
    extractRGB(headingElt.style.backgroundColor),
    extractRGB(headingElt.style.color)
  );

  aaCompliant.style.display = isAACompliant(ratio) ? "block" : "none";
  notAACompliant.style.display = isAACompliant(ratio) ? "none" : "block";
  aaaCompliant.style.display = isAAACompliant(ratio) ? "block" : "none";
  notAAACompliant.style.display = isAAACompliant(ratio) ? "none" : "block";
  complianceNumber.innerHTML = ratio;
};

export default function Home() {
  return (
    <>
      <label>
        Text{" "}
        <input
          className="txtColor"
          type="color"
          onChange={({ target: { value: txtColor } }) =>
            setTextColors({ txtColor })
          }
        />
      </label>
      <br />
      <label>
        Background{" "}
        <input
          className="bgColor"
          type="color"
          onChange={({ target: { value: bgColor } }) =>
            setTextColors({ bgColor })
          }
        />
      </label>

      <h1 className="heading">Hello World</h1>

      <h2 className="aaCompliant">Is AA Compliant</h2>
      <h2 className="notAACompliant" style={{display: "none"}}>
        Is NOT AA Compliant
      </h2>
      <h2 className="aaaCompliant">Is AAA Compliant</h2>
      <h2 className="notAAACompliant" style={{display: "none"}}>
        Is NOT AAA Compliant
      </h2>
      <h2 className="complianceNumber"></h2>
    </>
  );
}
