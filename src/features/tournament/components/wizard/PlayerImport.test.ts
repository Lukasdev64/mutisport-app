import { describe, it, expect } from 'bun:test';
import type { Player } from '@/types/tournament';

/**
 * Testing the CSV parsing logic from PlayerImport component
 * Extracted for unit testing purposes
 */

interface ParsedPlayer {
  name: string;
  age?: number;
  ranking?: string;
  email?: string;
}

interface ImportError {
  line: number;
  message: string;
}

interface ParseResult {
  players: ParsedPlayer[];
  errors: ImportError[];
}

/**
 * Parse CSV content into player objects (extracted from PlayerImport component)
 */
function parseCSV(content: string, existingPlayers: Player[] = []): ParseResult {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  const players: ParsedPlayer[] = [];
  const errors: ImportError[] = [];

  if (lines.length === 0) {
    return { players: [], errors: [{ line: 0, message: 'Fichier vide' }] };
  }

  // Detect if first line is a header
  const firstLine = lines[0].toLowerCase();
  const hasHeader = firstLine.includes('name') || firstLine.includes('nom') ||
                   firstLine.includes('joueur') || firstLine.includes('player');
  const startIndex = hasHeader ? 1 : 0;

  // Detect delimiter
  const delimiter = firstLine.includes(';') ? ';' : ',';

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(delimiter).map(p => p.trim().replace(/^"|"$/g, ''));
    const lineNumber = i + 1;

    // Minimum requirement: name
    if (!parts[0]) {
      errors.push({ line: lineNumber, message: 'Nom manquant' });
      continue;
    }

    const player: ParsedPlayer = {
      name: parts[0]
    };

    // Optional: age (column 2)
    if (parts[1]) {
      const age = parseInt(parts[1]);
      if (!isNaN(age) && age > 0 && age < 120) {
        player.age = age;
      }
    }

    // Optional: ranking (column 3)
    if (parts[2]) {
      player.ranking = parts[2];
    }

    // Optional: email (column 4)
    if (parts[3] && parts[3].includes('@')) {
      player.email = parts[3];
    }

    // Check for duplicates
    const isDuplicate = existingPlayers.some(p =>
      p.name.toLowerCase() === player.name.toLowerCase()
    ) || players.some(p =>
      p.name.toLowerCase() === player.name.toLowerCase()
    );

    if (isDuplicate) {
      errors.push({ line: lineNumber, message: `"${player.name}" existe déjà` });
      continue;
    }

    players.push(player);
  }

  return { players, errors };
}

describe('PlayerImport CSV Parsing', () => {
  describe('Basic Parsing', () => {
    it('should parse simple list of names', () => {
      const csv = `Alice
Bob
Charlie`;

      const result = parseCSV(csv);

      expect(result.players).toHaveLength(3);
      expect(result.players[0].name).toBe('Alice');
      expect(result.players[1].name).toBe('Bob');
      expect(result.players[2].name).toBe('Charlie');
      expect(result.errors).toHaveLength(0);
    });

    it('should handle empty content', () => {
      const result = parseCSV('');

      expect(result.players).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Fichier vide');
    });

    it('should skip empty lines', () => {
      const csv = `Alice

Bob

Charlie`;

      const result = parseCSV(csv);

      expect(result.players).toHaveLength(3);
    });
  });

  describe('Header Detection', () => {
    it('should detect "name" header and skip it', () => {
      const csv = `name,age,ranking
Alice,25,15/1
Bob,30,30/2`;

      const result = parseCSV(csv);

      expect(result.players).toHaveLength(2);
      expect(result.players[0].name).toBe('Alice');
    });

    it('should detect "nom" header (French)', () => {
      const csv = `Nom,Age,Classement
Alice,25,15/1
Bob,30,30/2`;

      const result = parseCSV(csv);

      expect(result.players).toHaveLength(2);
    });

    it('should detect "joueur" header (French)', () => {
      const csv = `Joueur,Age
Alice,25
Bob,30`;

      const result = parseCSV(csv);

      expect(result.players).toHaveLength(2);
    });

    it('should detect "player" header', () => {
      const csv = `Player,Age,Ranking,Email
Alice,25,15/1,alice@test.com`;

      const result = parseCSV(csv);

      expect(result.players).toHaveLength(1);
      expect(result.players[0].name).toBe('Alice');
    });

    it('should not skip first line if no header detected', () => {
      const csv = `Alice,25,15/1
Bob,30,30/2`;

      const result = parseCSV(csv);

      expect(result.players).toHaveLength(2);
      expect(result.players[0].name).toBe('Alice');
    });
  });

  describe('Delimiter Detection', () => {
    it('should use comma as default delimiter', () => {
      const csv = `name,age,ranking
Alice,25,15/1`;

      const result = parseCSV(csv);

      expect(result.players[0].name).toBe('Alice');
      expect(result.players[0].age).toBe(25);
      expect(result.players[0].ranking).toBe('15/1');
    });

    it('should detect semicolon delimiter', () => {
      const csv = `name;age;ranking
Alice;25;15/1`;

      const result = parseCSV(csv);

      expect(result.players[0].name).toBe('Alice');
      expect(result.players[0].age).toBe(25);
      expect(result.players[0].ranking).toBe('15/1');
    });
  });

  describe('Field Parsing', () => {
    it('should parse all optional fields', () => {
      const csv = `Name,Age,Ranking,Email
Alice Martin,25,15/1,alice@example.com`;

      const result = parseCSV(csv);

      expect(result.players[0]).toEqual({
        name: 'Alice Martin',
        age: 25,
        ranking: '15/1',
        email: 'alice@example.com'
      });
    });

    it('should handle missing optional fields', () => {
      const csv = `Name,Age,Ranking
Alice,,`;

      const result = parseCSV(csv);

      expect(result.players[0].name).toBe('Alice');
      expect(result.players[0].age).toBeUndefined();
      expect(result.players[0].ranking).toBeUndefined();
    });

    it('should validate age is positive and under 120', () => {
      const csv = `Name,Age
Alice,-5
Bob,150
Charlie,25`;

      const result = parseCSV(csv);

      expect(result.players[0].age).toBeUndefined(); // -5 is invalid
      expect(result.players[1].age).toBeUndefined(); // 150 is invalid
      expect(result.players[2].age).toBe(25);
    });

    it('should validate email contains @', () => {
      const csv = `Name,Age,Ranking,Email
Alice,25,15/1,notanemail
Bob,30,30/2,bob@test.com`;

      const result = parseCSV(csv);

      expect(result.players[0].email).toBeUndefined();
      expect(result.players[1].email).toBe('bob@test.com');
    });

    it('should strip quotes from fields', () => {
      const csv = `Name,Age
"Alice Martin",25
"Bob Dupont",30`;

      const result = parseCSV(csv);

      expect(result.players[0].name).toBe('Alice Martin');
      expect(result.players[1].name).toBe('Bob Dupont');
    });
  });

  describe('Duplicate Detection', () => {
    it('should detect duplicates in same file', () => {
      const csv = `Name
Alice
Bob
Alice`;

      const result = parseCSV(csv);

      expect(result.players).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Alice');
      expect(result.errors[0].message).toContain('existe déjà');
    });

    it('should detect duplicates against existing players', () => {
      const csv = `Name
Alice
Charlie`;

      const existingPlayers: Player[] = [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' }
      ];

      const result = parseCSV(csv, existingPlayers);

      expect(result.players).toHaveLength(1);
      expect(result.players[0].name).toBe('Charlie');
      expect(result.errors).toHaveLength(1);
    });

    it('should detect duplicates case-insensitively', () => {
      const csv = `Name
Alice
ALICE
alice`;

      const result = parseCSV(csv);

      expect(result.players).toHaveLength(1);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    it('should report missing name error', () => {
      const csv = `Name,Age
,25
Bob,30`;

      const result = parseCSV(csv);

      expect(result.players).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].line).toBe(2);
      expect(result.errors[0].message).toBe('Nom manquant');
    });

    it('should report correct line numbers', () => {
      const csv = `Name
Alice
,
Bob
,`;

      const result = parseCSV(csv);

      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].line).toBe(3); // Empty name on line 3
      expect(result.errors[1].line).toBe(5); // Empty name on line 5
    });
  });

  describe('Windows Line Endings', () => {
    it('should handle Windows CRLF line endings', () => {
      const csv = "Name\r\nAlice\r\nBob\r\nCharlie";

      const result = parseCSV(csv);

      expect(result.players).toHaveLength(3);
      expect(result.players[0].name).toBe('Alice');
    });

    it('should handle mixed line endings', () => {
      const csv = "Name\r\nAlice\nBob\r\nCharlie";

      const result = parseCSV(csv);

      expect(result.players).toHaveLength(3);
    });
  });

  describe('Real-world Examples', () => {
    it('should parse FFT-style export', () => {
      const csv = `Nom;Age;Classement;Email
Martin Alice;25;15/1;alice.martin@email.fr
Dupont Bob;32;30/2;bob.dupont@email.fr
Durand Charlie;28;NC;charlie.durand@email.fr`;

      const result = parseCSV(csv);

      expect(result.players).toHaveLength(3);
      expect(result.players[0].name).toBe('Martin Alice');
      expect(result.players[0].ranking).toBe('15/1');
      expect(result.players[2].ranking).toBe('NC');
    });

    it('should parse minimal club list', () => {
      const csv = `Pierre
Jean
Marie
Paul
Claire`;

      const result = parseCSV(csv);

      expect(result.players).toHaveLength(5);
      expect(result.errors).toHaveLength(0);
    });
  });
});
