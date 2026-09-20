# EverFound Modernization — Inventory & Schema

## 1. Original Page Inventory (from everfound.zip)

### Present in the zip (usable)

| Original file                    | Purpose                              | Priority |
|----------------------------------|--------------------------------------|----------|
| `default.cfm`                    | Login / home page                    | High     |
| `application.cfm`                | App bootstrap + session init         | High     |
| `act_checkcookie.cfm`            | "Remember Me" cookie login           | High     |
| `check_cookie.cfm`               | Cookie helper                        | High     |
| `common/i_check_login.cfm`       | Auth guard                           | High     |
| `common/i_header.cfm`            | Main header + tab navigation         | High     |
| `common/i_footer.cfm`            | Footer                               | High     |
| `common/i_navbar.cfm`            | Navbar                               | Medium   |
| `common/secureform.cfm`          | Primitive XSS filter                 | —        |
| `contacts_main.cfm`              | Main contacts list (referenced)      | High     |
| `contacts.cfm`                   | Contacts entry                       | High     |
| `contact_list_post.cfm`          | Bulk contact actions                 | High     |
| `contact_check.cfm`              | Contact validation                   | Medium   |
| `delete_contact.cfm`             | Delete contact                       | High     |
| `edit_folder.cfm` / `_post`      | Folder management                    | High     |
| `edit_account.cfm` / `_post`     | Account / password change            | High     |
| `edit_group.cfm` / `_post`       | Group create/edit                    | High     |
| `edit_group_settings.cfm` / `_post` | Group settings                    | Medium   |
| `delete_group.cfm` / `_post`     | Delete group                         | Medium   |
| `AddEditAppointment.cfm`         | Create/edit appointment              | High     |
| `AppointmentList.cfm` / `Post`   | Appointment listing                  | High     |
| `AppointmentMain.cfm`            | Appointments hub                     | High     |
| `AppointmentRespond.cfm`         | Respond to invite                    | Medium   |
| `calendar.cfm` / `calendarwin.cfm` | Calendar views                     | Medium   |
| `AddEditCar.cfm` / `CarCheck.cfm`| Car recall feature                   | Low      |
| `auto_invite.cfm` / `_post`      | Invite system                        | High     |
| `final_group_invites.cfm`        | Group invite finalization            | Medium   |
| `ContactLabelSelect.cfm` / `Post`| Address label printing               | Low      |
| `about.cfm`                      | About page                           | Low      |
| `ContestRules.cfm`               | Contest                              | Low      |
| `Goodbye.cfm`                    | Logout confirmation                  | Medium   |

### Referenced but **missing** from the zip

These were linked in the code but not present. We will recreate them:

- `groups_main.cfm`
- `preferences_main.cfm`
- `logout.cfm`
- `join.cfm` (full version — only copies exist)
- `how.cfm`
- `privacy.cfm`
- `password_reminder.cfm`
- `session_expired.cfm`
- `main.css`
- Many graphics (only partial set extracted)

### Graphics present (partial)

Tab buttons: `app_on.gif`, `app_off.gif`, contacts/groups/preferences equivalents expected  
Header pieces: `h_top_left.gif`, `h_top_right.gif`, `h_top_repeat.gif`, `benefit.gif`, etc.  
Backgrounds and icons for birthdays, anniversaries, stick-man, etc.

---

## 2. Inferred Database Schema (Prisma)

See `prisma/schema.prisma` for the full modern definition.

### Core tables reconstructed

**members**
- member_id, login_email, password (→ password_hash), live_member_ind
- default_rows_per_page, default_folder_id
- last_login_date, num_logins, timezone

**contacts**
- contact_id, contact_type ('M' = manual)
- first_name, last_name, nick_name, email
- Personal address: p_street1/2, p_city, p_state, p_province, p_zip, p_country
- Business address: b_street1/2, ...
- phones, birthday, anniversary, notes

**member_contacts** (join)
- member_id + contact_id, status ('A'/'D')

**folders** + **folder_contacts**
- Per-member folders containing contacts

**groups**
- group_id, member_id (owner), group_name
- all_invite_ind, uses_year_ind, year_header

**appointment** + **appointmentsend** + **appointmentnote**
- Full appointment + invite/response tracking

**member_car** + **carmake**
- Secondary car-recall feature

**Lookup tables**
- country, state, timezone, college

### Important original design notes

1. A member’s own record is also a row in `contacts` (member_id == contact_id).
2. Soft-delete via status flags rather than hard deletes in many places.
3. Stored procedures existed (`p_invite_contact`, `p_invite_contact_to_group`) — we will replace with application logic.
4. Passwords were stored in **plain text**. New system uses bcrypt.

---

## 3. Modern Architecture Decisions

- **Classic multi-page app**: Each major screen is its own route (`/contacts`, `/groups`, `/appointments`, etc.). No SPA client routing.
- **Server Components + Server Actions**: Forms post to the same or related routes (mirrors old `*_post.cfm` pattern).
- **Visual fidelity**: Shared layout component that reproduces the original blue header + image-based tabs using the original graphics where available, and CSS recreations otherwise.
- **Auth**: iron-session (encrypted cookie) + bcrypt. Supports “Remember Me”.
- **Database**: PostgreSQL via Prisma.
- **Hosting**: Vercel (recommended) + Neon / Vercel Postgres / Supabase for the database.

---

## 4. Recommended Route Map (classic multi-page)

| Route                        | Replaces                          |
|-----------------------------|-----------------------------------|
| `/`                         | `default.cfm` (login / home)      |
| `/login`                    | login form action                 |
| `/logout`                   | `logout.cfm` / `Goodbye.cfm`      |
| `/contacts`                 | `contacts_main.cfm`               |
| `/contacts/new`             | add contact                       |
| `/contacts/[id]`            | edit / view contact               |
| `/contacts/delete`          | `delete_contact.cfm`              |
| `/folders`                  | folder management                 |
| `/groups`                   | `groups_main.cfm`                 |
| `/groups/[id]`              | `edit_group.cfm`                  |
| `/appointments`             | `AppointmentMain.cfm`             |
| `/appointments/new`         | `AddEditAppointment.cfm`          |
| `/appointments/[id]`        | edit / respond                    |
| `/account`                  | `edit_account.cfm`                |
| `/car`                      | `AddEditCar.cfm` / `CarCheck.cfm` |
| `/join`                     | registration                      |
| `/about`, `/privacy`, `/how`| static pages                      |

---

## 5. Next Steps After Foundation

1. Run `npm install`
2. Set up a free Postgres (Neon, Supabase, or Vercel Postgres)
3. `npx prisma db push`
4. Implement the shared classic layout + login flow
5. Build Contacts as the first full feature
6. Continue feature-by-feature

The foundation files are already created in this directory.
