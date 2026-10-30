"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/date-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { SleepRecord } from "@/lib/types";
import { todayKey } from "@/lib/utils/date";
import { scoreSleepQuality } from "@/lib/utils/sleep";

// 入睡/起床时间选项：00:00、00:30、01:00 … 23:30
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? 0 : 30;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

interface SleepFormProps {
  initial?: SleepRecord;
  onSubmit: (data: Omit<SleepRecord, "id">) => void;
  onCancel: () => void;
}

export function SleepForm({ initial, onSubmit, onCancel }: SleepFormProps) {
  const [date, setDate] = useState(initial?.date ?? todayKey());
  const [sleepTime, setSleepTime] = useState(initial?.sleepTime ?? "");
  const [wakeTime, setWakeTime] = useState(initial?.wakeTime ?? "09:00");
  const [napMinutes, setNapMinutes] = useState(initial?.napMinutes ?? 0);
  const [note, setNote] = useState(initial?.note ?? "");

  const handleSubmit = () => {
    if (!date) return;
    onSubmit({
      date,
      sleepTime,
      wakeTime,
      napMinutes: Number(napMinutes) || 0,
      // 系统自动测评：时长得分 + 熬夜得分
      quality: scoreSleepQuality(sleepTime, wakeTime, Number(napMinutes) || 0),
      note,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-sm font-medium">日期</p>
        <DateField value={date} onChange={setDate} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1 text-sm font-medium">入睡时间</p>
          <Select value={sleepTime} onChange={(e) => setSleepTime(e.target.value)}>
            <option value="">请选择</option>
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <p className="mb-1 text-sm font-medium">起床时间</p>
          <Select value={wakeTime} onChange={(e) => setWakeTime(e.target.value)}>
            <option value="">请选择</option>
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">午睡时长（分钟）</p>
        <Input
          type="number"
          min={0}
          value={napMinutes}
          onChange={(e) => setNapMinutes(Number(e.target.value))}
        />
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">备注</p>
        <Textarea placeholder="补充说明…" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button onClick={handleSubmit}>保存</Button>
      </div>
    </div>
  );
}