/**
 * Export Panel Component
 * Provides PDF export and print functionality
 */

import React, { useState, useRef } from 'react'
import { exportBracketToPDF, exportTournamentToPDF, printBracket } from '../../../utils/exportPDF'
import './ExportPanel.css'

const ExportPanel = ({
  bracketRef,
  tournament,
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState(null)

  const handleExportBracket = async () => {
    if (!bracketRef?.current) {
      setExportStatus({ type: 'error', message: 'Bracket not found' })
      return
    }

    setIsExporting(true)
    setExportStatus(null)

    try {
      const filename = `${tournament.name.replace(/\s+/g, '-')}-bracket.pdf`
      const result = await exportBracketToPDF(bracketRef.current, filename)

      if (result.success) {
        setExportStatus({ type: 'success', message: 'PDF exported successfully!' })
      } else {
        setExportStatus({ type: 'error', message: 'Failed to export PDF' })
      }
    } catch (error) {
      console.error('Export error:', error)
      setExportStatus({ type: 'error', message: error.message })
    } finally {
      setIsExporting(false)
      setTimeout(() => setExportStatus(null), 3000)
    }
  }

  const handleExportFull = async () => {
    if (!bracketRef?.current) {
      setExportStatus({ type: 'error', message: 'Bracket not found' })
      return
    }

    setIsExporting(true)
    setExportStatus(null)

    try {
      const filename = `${tournament.name.replace(/\s+/g, '-')}-full.pdf`
      const result = await exportTournamentToPDF(bracketRef.current, tournament, filename)

      if (result.success) {
        setExportStatus({ type: 'success', message: 'Full PDF exported successfully!' })
      } else {
        setExportStatus({ type: 'error', message: 'Failed to export PDF' })
      }
    } catch (error) {
      console.error('Export error:', error)
      setExportStatus({ type: 'error', message: error.message })
    } finally {
      setIsExporting(false)
      setTimeout(() => setExportStatus(null), 3000)
    }
  }

  const handlePrint = () => {
    if (!bracketRef?.current) {
      setExportStatus({ type: 'error', message: 'Bracket not found' })
      return
    }

    try {
      printBracket(bracketRef.current)
      setExportStatus({ type: 'success', message: 'Opening print dialog...' })
      setTimeout(() => setExportStatus(null), 2000)
    } catch (error) {
      console.error('Print error:', error)
      setExportStatus({ type: 'error', message: 'Failed to open print dialog' })
      setTimeout(() => setExportStatus(null), 3000)
    }
  }

  return (
    <div className={`export-panel ${className}`}>
      <h3 className="export-panel__title">📥 Export & Print</h3>

      {/* Status Message */}
      {exportStatus && (
        <div className={`export-panel__status export-panel__status--${exportStatus.type}`}>
          {exportStatus.type === 'success' && '✓'}
          {exportStatus.type === 'error' && '✗'}
          {' '}
          {exportStatus.message}
        </div>
      )}

      {/* Export Options */}
      <div className="export-panel__options">
        <button
          className="export-panel__btn export-panel__btn--primary"
          onClick={handleExportBracket}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <span className="export-panel__spinner" />
              Exporting...
            </>
          ) : (
            <>
              📄 Export Bracket
            </>
          )}
        </button>

        <button
          className="export-panel__btn export-panel__btn--secondary"
          onClick={handleExportFull}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <span className="export-panel__spinner" />
              Exporting...
            </>
          ) : (
            <>
              📋 Export Full Report
            </>
          )}
        </button>

        <button
          className="export-panel__btn export-panel__btn--secondary"
          onClick={handlePrint}
          disabled={isExporting}
        >
          🖨️ Print
        </button>
      </div>

      {/* Info */}
      <div className="export-panel__info">
        <div className="export-panel__info-item">
          <span className="export-panel__info-icon">ℹ️</span>
          <span className="export-panel__info-text">
            <strong>Export Bracket</strong>: Exports only the bracket visualization
          </span>
        </div>

        <div className="export-panel__info-item">
          <span className="export-panel__info-icon">ℹ️</span>
          <span className="export-panel__info-text">
            <strong>Export Full Report</strong>: Includes tournament info + bracket
          </span>
        </div>

        <div className="export-panel__info-item">
          <span className="export-panel__info-icon">ℹ️</span>
          <span className="export-panel__info-text">
            <strong>Print</strong>: Opens browser print dialog for direct printing
          </span>
        </div>
      </div>
    </div>
  )
}

export default ExportPanel
