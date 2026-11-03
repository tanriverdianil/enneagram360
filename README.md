# enneagram360
Know thyself! Enneagram 360 is a self-discovery test that shows not only who you are, but where you stand with it today, and where you can go from here.

A 20-minute Enneagram self-discovery test in English, Turkish, German and Romanian.
Static site for GitHub Pages; results and email addresses go to a private Google Sheet through Google Apps Script.

| File | What it is |
|---|---|
| `index.html` | The test (landing page, questions, email step, profile) |
| `privacy.html` | Privacy notice in four languages |
| `favicon.svg`, `og-image.png` | Browser icon and the preview picture shown when the link is shared |
| `apps-script.gs` | Backend code to paste into Google Apps Script (does not need to be on GitHub) |

Preview mode for checking result pages: open the site address with `#preview` at the end.

---

## Setup (about 20 minutes)

### 1. Publish the page on GitHub
1. On github.com, click **New repository**, name it `enneagram360`, choose **Public**, then **Create repository**.
2. Click **uploading an existing file**, drag in `index.html`, `privacy.html`, `favicon.svg`, `og-image.png` and `README.md`, then **Commit changes**.
3. Go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
4. After 1–2 minutes the site is live at `https://tanriverdianil.github.io/enneagram360/`.

### 2. Create the Google Sheet and the script
1. Open **sheets.new** (signed in as tanriverdi.anil@gmail.com) and name the sheet *Enneagram 360 – Pilot results*.
2. Click **Extensions → Apps Script**. Delete everything in `Code.gs` and paste the full content of `apps-script.gs`.
3. Line 8 already contains the site address. Click **Save** (the disk icon).
4. In the function menu at the top, choose **testEmailToMyself** and click **Run**. Google asks for permission:
   **Review permissions → your account → Advanced → Go to (unsafe) → Allow.** This warning appears because it is your own, unpublished script.
   You should receive a sample profile email within a minute.
5. Click **Deploy → New deployment → ⚙ → Web app**:
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**

   Then click **Deploy** and copy the **Web app URL** (it ends with `/exec`).

### 3. Connect the page to the script
Open `index.html`, search for `const SCRIPT_URL = "";` and paste the Web app URL between the quotes. Upload the changed `index.html` to GitHub again.
(Or send both addresses to Claude and get a ready file back.)

### 4. Test once
Take the test with your own email and tick both boxes. You should see:
- a new row in the sheet tab **Results**
- the profile email in your inbox, with a working **Open my full profile** button
- after clicking **Confirm my subscription**, *Newsletter* in the sheet changes to `confirmed`

---

## Good to know
- **Changing the script later:** use **Deploy → Manage deployments → ✏ Edit → Version: New version → Deploy.** The URL stays the same.
- **Limits:** a free Gmail account sends about 100 emails per day. The script stops automatic emails when 10 are left. Rows are still saved, and the person sees a message to come back later.
- **Spam protection:** hidden trap field, input checks, and at most one email per address every 10 minutes.
- **Newsletter list:** filter the sheet column *Newsletter* = `confirmed`. Only those people may receive updates.
- **Deleting someone's data:** delete their row in the sheet.
