import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle2, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import type { Player } from '@/types/tournament';

interface PlayerImportProps {
  onImport: (players: Player[]) => void;
  existingPlayers?: Player[];
}

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

/**
 * Component for importing players from CSV files
 * Supports formats:
 * - Simple: name per line
 * - Full: name,age,ranking,email (with header row)
 */
export function PlayerImport({ onImport, existingPlayers = [] }: PlayerImportProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [parsedPlayers, setParsedPlayers] = useState<ParsedPlayer[]>([]);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Parse CSV content into player objects
   */
  const parseCSV = useCallback((content: string): { players: ParsedPlayer[]; errors: ImportError[] } => {
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
  }, [existingPlayers]);

  /**
   * Handle file selection
   */
  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setErrors([{ line: 0, message: 'Format non supporté. Utilisez .csv ou .txt' }]);
      return;
    }

    setIsProcessing(true);
    setErrors([]);
    setParsedPlayers([]);

    try {
      const content = await file.text();
      const { players, errors } = parseCSV(content);

      setParsedPlayers(players);
      setErrors(errors);
    } catch (err) {
      setErrors([{ line: 0, message: 'Erreur de lecture du fichier' }]);
    } finally {
      setIsProcessing(false);
    }
  }, [parseCSV]);

  /**
   * Drag & Drop handlers
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  /**
   * Convert parsed players to full Player objects and import
   */
  const handleImport = useCallback(() => {
    const bgColors = ['b6e3f4', 'c0aede', 'd1d4f9'];

    const players: Player[] = parsedPlayers.map(p => {
      const id = uuidv4();
      const bg = bgColors[Math.floor(Math.random() * bgColors.length)];

      return {
        id,
        name: p.name,
        age: p.age,
        ranking: p.ranking,
        avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(id)}&backgroundColor=${bg}`
      };
    });

    onImport(players);
    setParsedPlayers([]);
    setErrors([]);
  }, [parsedPlayers, onImport]);

  /**
   * Download template CSV
   */
  const downloadTemplate = useCallback(() => {
    const template = `Nom,Age,Classement,Email
Alice Martin,25,15/1,alice@example.com
Bob Dupont,32,30/2,bob@example.com
Charlie Durand,28,,charlie@example.com`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'joueurs_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  /**
   * Remove a player from the parsed list
   */
  const removePlayer = useCallback((index: number) => {
    setParsedPlayers(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
          isDragOver
            ? "border-blue-500 bg-blue-500/10"
            : "border-white/10 hover:border-white/20 hover:bg-white/5"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />

        <Upload className={cn(
          "w-10 h-10 mx-auto mb-3 transition-colors",
          isDragOver ? "text-blue-400" : "text-slate-500"
        )} />

        <p className="text-slate-300 font-medium mb-1">
          Glissez un fichier CSV ici
        </p>
        <p className="text-sm text-slate-500">
          ou cliquez pour sélectionner
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            downloadTemplate();
          }}
          className="mt-4 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mx-auto"
        >
          <Download className="w-3 h-3" />
          Télécharger le template
        </button>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Traitement en cours...
        </div>
      )}

      {/* Errors */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
              <AlertCircle className="w-4 h-4" />
              {errors.length} erreur{errors.length > 1 ? 's' : ''} détectée{errors.length > 1 ? 's' : ''}
            </div>
            <ul className="text-sm text-red-300/70 space-y-1">
              {errors.slice(0, 5).map((err, idx) => (
                <li key={idx}>
                  {err.line > 0 && `Ligne ${err.line}: `}{err.message}
                </li>
              ))}
              {errors.length > 5 && (
                <li className="text-red-400">... et {errors.length - 5} autres</li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parsed Players Preview */}
      <AnimatePresence>
        {parsedPlayers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-800/50 border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                {parsedPlayers.length} joueur{parsedPlayers.length > 1 ? 's' : ''} prêt{parsedPlayers.length > 1 ? 's' : ''}
              </div>
              <button
                onClick={() => setParsedPlayers([])}
                className="text-xs text-slate-500 hover:text-white"
              >
                Effacer
              </button>
            </div>

            <div className="max-h-[200px] overflow-y-auto space-y-2">
              {parsedPlayers.map((player, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span className="text-white">{player.name}</span>
                    {player.age && (
                      <span className="text-xs text-slate-500">({player.age} ans)</span>
                    )}
                    {player.ranking && (
                      <span className="text-xs text-emerald-500">[{player.ranking}]</span>
                    )}
                  </div>
                  <button
                    onClick={() => removePlayer(idx)}
                    className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <Button
              onClick={handleImport}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Importer {parsedPlayers.length} joueur{parsedPlayers.length > 1 ? 's' : ''}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
