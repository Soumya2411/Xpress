'use client';

import { useMemo, useState } from 'react';
import { Range } from 'react-date-range';
import { Calendar } from 'react-date-range';
import {
  addDays,
  addHours,
  eachDayOfInterval,
  eachMinuteOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameMinute,
  parse,
  parseISO,
  set,
  startOfDay,
  startOfToday,
  startOfWeek,
} from 'date-fns';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

import { cn } from '../datepicker/libs/utils';
import Button from '../Button';
import { Feature } from '@prisma/client';
import { SafeReservation } from '@/app/types';

interface TimeOption {
  value: string;
  label: string;
}

interface ListingReservationProps {
  price: number;
  dateRange: Range;
  totalPrice: number;
  onChangeDate: (value: Range) => void;
  onSubmit: () => void;
  disabled?: boolean;
  disableDates: Date[];
  onSelect: (date: Date) => void;
  handleTimeSelect: (time: Date) => void;
  reserved: SafeReservation[];
  features: Feature[];
  removeFeature: (featureIndex: number) => void;
  time:string
  
}

const ListingReservation: React.FC<ListingReservationProps> = ({
  onChangeDate,
  onSubmit,
  onSelect,
  time,
  disabled,
  handleTimeSelect,
  reserved = [],
  features,
  removeFeature,
  
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onSelect(date);
  };



  const minSelectableDate = addDays(new Date(), 0);

  let today = startOfToday();
  let [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'));
  let firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', selectedDate);
  let days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth), { weekStartsOn: 1 }),
  });
  const reservations = [
    addHours(today, 5).toString(),
    addHours(today, 6).toString(),
    addHours(today, 7).toString(),
    addHours(today, 8).toString(),
    addHours(today, 9).toString(),
    addDays(new Date(addHours(today, 4)), 3).toString(),
  ];
  console.log(time)
  let [freeTimes, setFreeTimes] = useState<Date[]>([]);
  useMemo(() => {
    //filter out past times from freeTimes array to prevent booking in the past
    function addHours(date:any, hours:any) {
      date.setTime(date.getTime() + hours * 60 * 60 * 1000);
      return date;
    }
    const now = addHours(new Date(), 1);
    const StartOfToday = startOfDay(selectedDate);
    const endOfToday = endOfDay(selectedDate);
    const startHour = set(StartOfToday, { hours:parseInt(time[0]+time[1]) });
    const endHour = set(endOfToday, { hours: 19, minutes: 45 });
    let hoursInDay = eachMinuteOfInterval(
      {
        start: startHour,
        end: endHour,
      },
      { step: 30 }
    );

    let freeTimes = hoursInDay.filter(hour => {
      const hourISO = parseISO(hour.toISOString());
      return !reservations.includes(hourISO.toString()) && hourISO > now; // Filter out past times
    });
    setFreeTimes(freeTimes);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handleTimeClick = (time: Date) => {
    setSelectedTime(time);
    handleTimeSelect(time);
  };

  const taxRate = 0.02;
  const total = (features.reduce((previous, current) => previous + current.price, 0)) 
   const totalPriceAfterTax= (total + (total * taxRate)).toFixed(2);
  const taxPrice = (total * taxRate);

  return (
    <div className="bg-white rounded-xl border-[1px] border-neutral-200 overflow-hidden">
      <Calendar
        color="#000"
        minDate={minSelectableDate}
        date={selectedDate}
        onChange={handleDateSelect}
      />
      <hr />

      <div>
        <div className="flex flex-col items-center gap-2 mt-4 p-4">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 text-md gap-2">
            {freeTimes.map((hour, hourIdx) => {
              const isDisabled = reserved.some((reservation) =>
                isSameMinute(new Date(reservation.startTime), hour)
              );

              return (
                <div key={hourIdx}>
                  <button
                    type="button"
                    className={cn(
                      'bg-green-200 rounded-lg px-2 text-gray-800 relative hover:border hover:border-green-400 w-[60px] h-[26px]',
                      selectedTime &&
                      isSameMinute(selectedTime, hour) &&
                      'bg-black text-white',
                      isDisabled && 'bg-gray-400 cursor-not-allowed'
                    )}
                    onClick={() => handleTimeClick(hour)}
                  >
                    {format(hour, 'HH:mm')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <hr />
      <div className="flex flex-col p-2">
        <div className="px-2   font-semibold text-sm ">
          {features.map((feature, index) => (
            <div key={index} className="feature grid grid-cols-3 py-2">
              {feature.service} 
              <div className="">
              ₹{feature.price}
               </div>
              <button className='text-red-400' onClick={() => removeFeature(index)}>Cancel</button>
            </div>
            
          ))}
          <div className="grid grid-cols-3">
          <div>Tax(2%)</div>
          <div>₹{taxPrice.toFixed(2)}</div>
          </div>
        </div>

        <div className="p-4 flex flex-row items-center justify-between font-semibold text-lg ">
          <div>Total</div>
          <div>₹{totalPriceAfterTax}</div>
        </div>

        <Button label="Reserve" disabled={disabled} onClick={onSubmit} />
      </div>
    </div>
  );
};

export default ListingReservation;
