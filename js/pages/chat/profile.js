/*
|--------------------------------------------------------------------------
| PROFILE FEATURE
|--------------------------------------------------------------------------
|
| Handles profile-related UI and actions.
|
| This file is intentionally kept separate from chat.js so profile
| functionality can grow without making chat.js larger.
|
|--------------------------------------------------------------------------
*/

import { CONFIG } from "../config.js";


/*
|--------------------------------------------------------------------------
| PROFILE STATE
|--------------------------------------------------------------------------
*/

let contextRef = null;


/*
|--------------------------------------------------------------------------
| INITIALIZE PROFILE
|--------------------------------------------------------------------------
|
| Called by the application when the profile feature is loaded.
|
| The context object can later contain:
|
| - current user
| - container
| - navigation
| - API helpers
| - settings
|
|--------------------------------------------------------------------------
*/

export function init(context = {}) {

  contextRef = context;


  /*
  |--------------------------------------------------------------------------
  | CLEANUP
  |--------------------------------------------------------------------------
  |
  | Returning a cleanup function allows the feature to be safely
  | removed or reloaded without leaving event listeners behind.
  |
  |--------------------------------------------------------------------------
  */

  return () => {

    contextRef = null;

  };

}


/*
|--------------------------------------------------------------------------
| GET PROFILE CONTEXT
|--------------------------------------------------------------------------
|
| Allows other frontend modules to access the current profile feature
| context without exposing internal state directly.
|
|--------------------------------------------------------------------------
*/

export function getProfileContext() {

  return contextRef;

}


/*
|--------------------------------------------------------------------------
| PROFILE BRANDING
|--------------------------------------------------------------------------
|
| Centralized branding information.
|
| This means profile-related UI does not need to hard-code
| "Johnny Tec OS" or the logo path.
|
|--------------------------------------------------------------------------
*/

export function getProfileBranding() {

  return {
    appName:
      CONFIG?.appName ||
      "Johnny Tec OS",

    logo:
      CONFIG?.logo ||
      "assets/images/johnny-tec-os.png",

    logoAlt:
      CONFIG?.logoAlt ||
      "Johnny Tec OS"
  };

}


/*
|--------------------------------------------------------------------------
| RENDER PROFILE LOGO
|--------------------------------------------------------------------------
|
| Utility for profile UI components that need the application logo.
|
| Usage:
|
| const logo = createProfileLogo();
| container.appendChild(logo);
|
|--------------------------------------------------------------------------
*/

export function createProfileLogo() {

  const branding =
    getProfileBranding();


  const image =
    document.createElement("img");


  image.src =
    branding.logo;


  image.alt =
    branding.logoAlt;


  image.className =
    "profile-logo";


  image.loading =
    "lazy";


  return image;

}


/*
|--------------------------------------------------------------------------
| RENDER PROFILE HEADER
|--------------------------------------------------------------------------
|
| Creates a lightweight profile header.
|
| The function does not replace the entire profile page.
| It only creates the reusable profile header component.
|
|--------------------------------------------------------------------------
*/

export function createProfileHeader({
  name = "User",
  email = ""
} = {}) {

  const branding =
    getProfileBranding();


  const header =
    document.createElement("div");


  header.className =
    "profile-header";


  header.innerHTML = `
    <div class="profile-header-brand">

      <img
        src="${escapeAttribute(
          branding.logo
        )}"
        alt="${escapeAttribute(
          branding.logoAlt
        )}"
        class="profile-logo"
      >

      <div class="profile-header-info">

        <strong class="profile-header-name">
          ${escapeHTML(name)}
        </strong>

        ${
          email
            ? `
              <span class="profile-header-email">
                ${escapeHTML(email)}
              </span>
            `
            : ""
        }

      </div>

    </div>
  `;


  return header;

}


/*
|--------------------------------------------------------------------------
| SAFE HTML ESCAPE
|--------------------------------------------------------------------------
*/

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/*
|--------------------------------------------------------------------------
| SAFE ATTRIBUTE ESCAPE
|--------------------------------------------------------------------------
*/

function escapeAttribute(value) {

  return escapeHTML(value);

}
