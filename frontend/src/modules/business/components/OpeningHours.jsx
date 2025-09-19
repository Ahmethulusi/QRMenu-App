import React from 'react';
import { TimePicker, Row, Col, Checkbox, Form } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = TimePicker;

const OpeningHours = ({ value, onChange }) => {
  const defaultHours = {
    monday: { isOpen: true, open: '09:00', close: '18:00' },
    tuesday: { isOpen: true, open: '09:00', close: '18:00' },
    wednesday: { isOpen: true, open: '09:00', close: '18:00' },
    thursday: { isOpen: true, open: '09:00', close: '18:00' },
    friday: { isOpen: true, open: '09:00', close: '18:00' },
    saturday: { isOpen: true, open: '09:00', close: '17:00' },
    sunday: { isOpen: false, open: '09:00', close: '17:00' }
  };

  const currentValue = value || defaultHours;

  const dayNames = {
    monday: 'Pazartesi',
    tuesday: 'Salı',
    wednesday: 'Çarşamba',
    thursday: 'Perşembe',
    friday: 'Cuma',
    saturday: 'Cumartesi',
    sunday: 'Pazar'
  };

  const handleDayToggle = (day, checked) => {
    const newValue = {
      ...currentValue,
      [day]: {
        ...currentValue[day],
        isOpen: checked
      }
    };
    onChange?.(newValue);
  };

  const handleTimeChange = (day, timeRange) => {
    if (!timeRange || timeRange.length !== 2) return;
    
    const newValue = {
      ...currentValue,
      [day]: {
        ...currentValue[day],
        open: timeRange[0].format('HH:mm'),
        close: timeRange[1].format('HH:mm')
      }
    };
    onChange?.(newValue);
  };

  const getTimeRange = (day) => {
    const dayData = currentValue[day];
    if (!dayData.open || !dayData.close) return null;
    
    return [
      dayjs(dayData.open, 'HH:mm'),
      dayjs(dayData.close, 'HH:mm')
    ];
  };

  return (
    <div className="opening-hours-container">
      {Object.keys(dayNames).map(day => (
        <Row key={day} gutter={16} style={{ marginBottom: '12px', alignItems: 'center' }}>
          <Col span={6}>
            <Checkbox
              checked={currentValue[day].isOpen}
              onChange={(e) => handleDayToggle(day, e.target.checked)}
            >
              {dayNames[day]}
            </Checkbox>
          </Col>
          <Col span={18}>
            <RangePicker
              format="HH:mm"
              placeholder={['Açılış', 'Kapanış']}
              value={currentValue[day].isOpen ? getTimeRange(day) : null}
              onChange={(timeRange) => handleTimeChange(day, timeRange)}
              disabled={!currentValue[day].isOpen}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      ))}
    </div>
  );
};

export default OpeningHours;
