# Multi-Sport Competition - User Guide

Complete guide for users of the Multi-Sport Competition platform.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Tournaments](#creating-tournaments)
3. [Managing Tournaments](#managing-tournaments)
4. [Tournament Formats](#tournament-formats)
5. [Bracket Management](#bracket-management)
6. [Updating Match Results](#updating-match-results)
7. [Sharing Tournaments](#sharing-tournaments)
8. [Exporting & Printing](#exporting--printing)
9. [Dark Mode](#dark-mode)
10. [FAQ](#faq)

---

## Getting Started

### Account Types

The platform supports two types of tournament creation:

1. **Authenticated Users**: Create an account to manage multiple tournaments
2. **Anonymous Users**: Create tournaments without an account using edit tokens

### Creating Your First Tournament

1. Navigate to the tournament creation page
2. Fill in tournament details:
   - **Name**: Tournament name (required, 3-200 characters)
   - **Format**: Choose from 4 formats (see [Tournament Formats](#tournament-formats))
   - **Sport**: Type of sport (optional)
   - **Max Participants**: Maximum number of players
   - **Description**: Optional tournament description

3. Add players:
   - Enter player names
   - Assign seeds (optional, for seeding)
   - You can add/remove players later

4. Click "Create Tournament"

### Edit Token (Anonymous Mode)

If creating without an account:
- You'll receive a **32-character edit token**
- **Save this token!** You'll need it to edit the tournament
- Store it securely (password manager recommended)
- You can convert to authenticated mode later

---

## Tournament Formats

### 1. Single Elimination

**Best for**: Quick tournaments, large participant counts

**How it works**:
- Lose once, you're out
- Winners advance to next round
- Bracket size: Powers of 2 (4, 8, 16, 32, etc.)
- If player count isn't a power of 2, byes are automatically added

**Match count**: n - 1 (where n = number of players)

**Example**: 8 players = 7 matches (Quarterfinals → Semifinals → Final)

---

### 2. Double Elimination

**Best for**: Competitive tournaments, giving players a second chance

**How it works**:
- **Winner Bracket**: Undefeated players
- **Loser Bracket**: Players with one loss
- **Grand Final**: Winner bracket champion vs Loser bracket champion
- **Bracket Reset**: If loser bracket player wins, replay final (both have 1 loss)

**Match count**: 2n - 2 (approximately)

**Example**: 8 players = 14 matches

**Special Rules**:
- Lose in winner bracket → drop to loser bracket
- Lose in loser bracket → eliminated
- Grand final may require 2 matches if loser bracket wins first

---

### 3. Round Robin

**Best for**: Small groups, league play, fair competition

**How it works**:
- Every player plays every other player once
- Results tracked in standings table
- Rankings by: Wins → Head-to-head → Points

**Match count**: n × (n - 1) / 2

**Example**: 6 players = 15 matches (5 rounds of 3 matches each)

**Standings**:
- **W-L**: Win-loss record
- **Points**: Total points scored
- **Rank**: Final position (🥇🥈🥉 for top 3)

---

### 4. Swiss System

**Best for**: Large tournaments, chess-style competition

**How it works**:
- Fixed number of rounds (typically log₂(n))
- Round 1: Top half vs bottom half
- Subsequent rounds: Pair players with similar scores
- No elimination - everyone plays all rounds

**Pairing Rules**:
- Never pair same opponents twice
- Avoid giving same player multiple byes
- Pair players with same/similar scores

**Tiebreakers**:
- **Buchholz Score**: Sum of opponents' scores (strength of schedule)

**Example**: 8 players = 3 rounds recommended

---

## Bracket Management

### Viewing Brackets

Each format has a specialized bracket view:

**Single Elimination**:
- Horizontal scrolling layout
- Connector lines showing progression
- Round names (Quarterfinals, Semifinals, Final)

**Double Elimination**:
- Winner bracket (yellow/gold theme)
- Loser bracket (red/pink theme)
- Grand final (blue theme)
- Color-coded for clarity

**Round Robin**:
- Standings table with live rankings
- Round tabs showing each matchday
- Completion badges (✓ when round done)

**Swiss System**:
- Progress bar showing rounds completed
- Standings with Buchholz scores
- "Generate Next Round" button (auto-appears when ready)

---

## Updating Match Results

### Basic Match Update

1. Click on a match card
2. Enter the score
3. Click winner's name OR "Set Winner" button
4. Match automatically advances winners (elimination formats)

### Score Formats

**Tennis Example**:
```
6-4 7-6(5)
```
- Sets separated by spaces
- Tiebreak score in parentheses
- Match tiebreak in square brackets: `[10-8]`

**Generic Sports**:
- Enter scores as needed
- System validates format
- Retired: add "ret." → `6-3 2-1 ret.`
- Walkover: enter `W.O.`

### Undo Match Result

1. Click on completed match
2. Click "Undo Result" button
3. Confirm action
4. Match resets to "TBD" state

**Note**: Undoing affects downstream matches in elimination brackets

---

## Sharing Tournaments

### QR Code

1. Open Share Panel
2. QR code auto-generates (200×200px)
3. Options:
   - **Scan**: Players scan to view on mobile
   - **Download PNG**: Save QR code image
   - **Print**: Include in venue materials

### Copy Link

- Click "Copy Link" button
- Share URL via any method
- Link format: `yourdomain.com/tournament/{url_code}`

### Social Media

Quick share buttons for:
- **Twitter/X**: Tweet tournament link
- **Facebook**: Share on timeline
- **WhatsApp**: Send to contacts/groups
- **Email**: Open mail client with pre-filled content

### Public URL

Every tournament has a unique URL code (8 characters):
```
https://yourdomain.com/tournament/abc12345
```

**View-only**: Anyone with link can view (no edit rights)

---

## Exporting & Printing

### Export Bracket (PDF)

**What's included**:
- Bracket visualization only
- All matches with current scores
- Round names and structure

**Best for**: Venue display, quick reference

**File name**: `{tournament-name}-bracket.pdf`

---

### Export Full Report (PDF)

**What's included**:
- Tournament metadata (name, format, date)
- Player list with seeds
- Complete bracket
- Match results
- Standings (Round Robin/Swiss)

**Best for**: Records, tournament archive, sharing complete info

**File name**: `{tournament-name}-full.pdf`

---

### Print

Opens browser print dialog with:
- Print-optimized CSS (light theme)
- Landscape orientation recommended
- Fits to page automatically

**Tip**: Preview before printing to adjust scaling

---

## Dark Mode

### Enable Dark Mode

**Method 1**: Click theme toggle button (sun/moon icon) in header

**Method 2**: System preference auto-detected
- MacOS: System Preferences → General → Appearance
- Windows: Settings → Personalization → Colors
- Linux: Varies by DE

### Theme Persistence

- Choice saved to localStorage
- Persists across sessions
- Override system preference anytime

### Print Behavior

PDFs and prints always use **light theme** for readability

---

## FAQ

### General

**Q: Can I edit a tournament after creation?**
A: Yes! Use your edit token (anonymous) or login (authenticated).

**Q: Can I convert anonymous tournament to authenticated?**
A: Yes, use the "Claim Tournament" feature with your edit token.

**Q: What happens if I lose my edit token?**
A: Unfortunately, edit tokens cannot be recovered. Create authenticated account to avoid this.

**Q: Is there a player limit?**
A: Recommended limits:
- Single/Double Elimination: 2-64 players
- Round Robin: 2-12 players (15+ matches for 6 players)
- Swiss: 4-128 players

---

### Tournament Management

**Q: Can I change format after creation?**
A: No, format is locked. Create new tournament if needed.

**Q: Can I add/remove players after bracket generation?**
A: You can add players before bracket generation. Removing players after generation not recommended.

**Q: How do byes work?**
A: Auto-distributed optimally. Top seeds avoid byes. Byes get automatic wins.

**Q: Can I manually seed players?**
A: Yes, assign seed numbers when adding players or reorder later.

---

### Match Results

**Q: Can I edit a match result?**
A: Yes, click match and update. Or undo and re-enter.

**Q: What if I undo a match that affected other matches?**
A: Downstream matches reset to TBD. You'll need to replay them.

**Q: Can I schedule match times?**
A: Yes, each match has optional date/time fields.

**Q: How are tiebreakers calculated (Swiss)?**
A: Buchholz = sum of opponents' scores (strength of schedule).

---

### Realtime & Sync

**Q: Do updates show live for spectators?**
A: Yes! Using Supabase Realtime:
- Match updates appear instantly
- Player stats sync automatically
- Presence tracking shows active viewers

**Q: What if I have connection issues?**
A: Changes saved to database. Refresh to sync.

---

### Export & Sharing

**Q: Can I customize PDF export?**
A: Currently fixed format. Custom exports coming in future updates.

**Q: Are QR codes permanent?**
A: Yes, QR code always points to same tournament URL.

**Q: Can I make tournament private?**
A: URL is public but not indexed. Share link only with intended participants.

---

### Technical

**Q: Which browsers are supported?**
A: Modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

**Q: Is data backed up?**
A: Yes, Supabase provides automatic backups.

**Q: Can I export raw data (JSON/CSV)?**
A: Not yet. Planned for future release.

**Q: Is there an API?**
A: Not public yet. Coming soon for integrations.

---

## Need Help?

- **Bug Reports**: [GitHub Issues](https://github.com/yourusername/multi-sport-competition/issues)
- **Feature Requests**: Submit via GitHub Issues
- **Email Support**: support@yourdomain.com

---

**Version**: 2.0.0 (Sprint 4)
**Last Updated**: January 2025
