import { X } from 'lucide-react';
import { useState } from 'react';
import {
  COVERAGE_PERIODS,
  DRIVER_CLASSES,
  PAYROLL_REGIONS,
} from '../../data/payrollSeed';
import type {
  CoveragePeriod,
  DriverClassification,
  ExchangeRates,
  PayrollRun,
} from '../../types';

export interface PayrollDateForm {
  coveragePeriod: CoveragePeriod;
  coverFrom: string;
  payrollDate: string;
  recurrence: string;
  classifications: DriverClassification[];
  region: string;
  exchange: ExchangeRates;
}

const EMPTY: PayrollDateForm = {
  coveragePeriod: 'Weekly',
  coverFrom: '',
  payrollDate: '',
  recurrence: '1',
  classifications: [...DRIVER_CLASSES],
  region: 'United States',
  exchange: { usdToCad: 1.4267, usdToPeso: 17.93, cadToPeso: 16.64 },
};

function fromRun(run: PayrollRun): PayrollDateForm {
  return {
    coveragePeriod: run.coveragePeriod,
    coverFrom: run.coverFrom,
    payrollDate: run.payrollDate,
    recurrence: '1',
    classifications: [...run.classifications],
    region: run.region,
    exchange: { ...run.exchange },
  };
}

export function PayrollDateModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: 'add' | 'edit';
  initial?: PayrollRun;
  onClose: () => void;
  onSave: (form: PayrollDateForm) => void;
}) {
  const [form, setForm] = useState<PayrollDateForm>(() =>
    initial ? fromRun(initial) : { ...EMPTY, classifications: [...DRIVER_CLASSES] },
  );

  const toggleClass = (c: DriverClassification) => {
    setForm((prev) => ({
      ...prev,
      classifications: prev.classifications.includes(c)
        ? prev.classifications.filter((x) => x !== c)
        : [...prev.classifications, c],
    }));
  };

  const valid =
    form.coverFrom.trim() &&
    form.payrollDate.trim() &&
    form.region &&
    form.classifications.length > 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-lg pay-date-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
      >
        <div className="modal-head">
          <h3>{mode === 'edit' ? 'Edit Payroll Date' : 'Add Payroll Date'}</h3>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className="modal-body">
          <div className="pay-date-grid">
            <div className="field">
              <label>Payroll Coverage Period</label>
              <select
                value={form.coveragePeriod}
                onChange={(e) =>
                  setForm((p) => ({ ...p, coveragePeriod: e.target.value as CoveragePeriod }))
                }
              >
                {COVERAGE_PERIODS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>
                Cover From<span className="req">*</span>
              </label>
              <input
                value={form.coverFrom}
                onChange={(e) => setForm((p) => ({ ...p, coverFrom: e.target.value }))}
                placeholder="e.g. Dec 22, 2025"
              />
            </div>
            <div className="field">
              <label>
                Payroll Date<span className="req">*</span>
              </label>
              <input
                value={form.payrollDate}
                onChange={(e) => setForm((p) => ({ ...p, payrollDate: e.target.value }))}
                placeholder="e.g. Jan 2, 2026"
              />
            </div>
            {mode === 'add' && (
              <div className="field">
                <label>
                  Recurrence<span className="req">*</span>
                </label>
                <select
                  value={form.recurrence}
                  onChange={(e) => setForm((p) => ({ ...p, recurrence: e.target.value }))}
                >
                  {['1', '2', '3', '4'].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="pay-date-mid">
            <div className="field">
              <label>
                Driver Classification<span className="req">*</span>
              </label>
              <div className="pay-check-row">
                {DRIVER_CLASSES.map((c) => (
                  <label key={c} className="pay-check">
                    <input
                      type="checkbox"
                      checked={form.classifications.includes(c)}
                      onChange={() => toggleClass(c)}
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="field">
              <label>
                Regions<span className="req">*</span>
              </label>
              <select
                value={form.region}
                onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
              >
                {PAYROLL_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Exchange Values</label>
            <div className="pay-exchange-row">
              <label className="pay-fx">
                <span>1 USD =</span>
                <input
                  type="number"
                  step="0.0001"
                  value={form.exchange.usdToCad}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      exchange: { ...p.exchange, usdToCad: Number(e.target.value) || 0 },
                    }))
                  }
                />
                <span>CAD</span>
              </label>
              <label className="pay-fx">
                <span>1 USD =</span>
                <input
                  type="number"
                  step="0.0001"
                  value={form.exchange.usdToPeso}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      exchange: { ...p.exchange, usdToPeso: Number(e.target.value) || 0 },
                    }))
                  }
                />
                <span>MXN Peso</span>
              </label>
              <label className="pay-fx">
                <span>1 CAD =</span>
                <input
                  type="number"
                  step="0.0001"
                  value={form.exchange.cadToPeso}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      exchange: { ...p.exchange, cadToPeso: Number(e.target.value) || 0 },
                    }))
                  }
                />
                <span>MXN Peso</span>
              </label>
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!valid}
            onClick={() => onSave(form)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
