/* eslint-disable camelcase */
const calendar = {

	init: function() {
		const month = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];
		const weekday = [
			'Sunday',
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday'
		];
		const weekdayShort = [
			'sun',
			'mon',
			'tue',
			'wed',
			'thu',
			'fri',
			'sat'
		];
		let monthDirection = 0;

		function getNextMonth() {
			monthDirection++;
			let current;
			const now = new Date();
			if (now.getMonth() === 11) {
				current = new Date(now.getFullYear() + monthDirection, 0, 1);
			} else {
				current = new Date(now.getFullYear(), now.getMonth() + monthDirection, 1);
			}
			initCalender(getMonth(current));
		}

		function getPrevMonth() {
			monthDirection--;
			let current;
			const now = new Date();
			if (now.getMonth() === 11) {
				current = new Date(now.getFullYear() + monthDirection, 0, 1);
			} else {
				current = new Date(now.getFullYear(), now.getMonth() + monthDirection, 1);
			}
			initCalender(getMonth(current));
		}
		Date.prototype.isSameDateAs = function(pDate) {
			return (
				this.getFullYear() === pDate.getFullYear() &&
				this.getMonth() === pDate.getMonth() &&
				this.getDate() === pDate.getDate()
			);
		};

		function getMonth(currentDay) {
			const now = new Date();
			const currentMonth = month[currentDay.getMonth()];
			const monthArr = [];
			// eslint-disable-next-line no-undef
			let i;
			for (i = 1 - currentDay.getDate(); i < 31; i++) {
				const tomorrow = new Date(currentDay);
				// eslint-disable-next-line no-undef
				tomorrow.setDate(currentDay.getDate() + i);
				if (currentMonth !== month[tomorrow.getMonth()]) {
					break;
				} else {
					monthArr.push({
						date: {
							weekday: weekday[tomorrow.getDay()],
							weekday_short: weekdayShort[tomorrow.getDay()],
							day: tomorrow.getDate(),
							month: month[tomorrow.getMonth()],
							year: tomorrow.getFullYear(),
							current_day: now.isSameDateAs(tomorrow) ? true : false,
							date_info: tomorrow
						}
					});
				}
			}
			return monthArr;
		}

		function clearCalender() {
			$('table tbody tr').each(function() {
				$(this).find('td').removeClass('active selectable currentDay between hover').html('');
			});
			$('td').each(function() {
				$(this).unbind('mouseenter').unbind('mouseleave');
			});
			$('td').each(function() {
				$(this).unbind('click');
			});
			clickCounter = 0;
		}

		function initCalender(monthData) {
			let row = 0;
			let classToAdd = '';
			let currentDay = '';
			const today = new Date();

			clearCalender();
			$.each(monthData,
				(i, value) => {
					const weekday = value.date.weekday_short;
					const day = value.date.day;
					let column = 0;
					const index = i + 1;

					$('.calendar__sideb .header .month').html(value.date.month);
					$('.calendar__sideb .header .year').html(value.date.year);
					if (value.date.current_day) {
						currentDay = 'currentDay';
						classToAdd = 'selectable';
						$('.calendar__right-wrapper .header span').html(value.date.weekday);
						$('.calendar__right-wrapper .day').html(value.date.day + 'th');
						$('.calendar__right-wrapper .month').html(value.date.month + ',');
						$('.calendar__right-wrapper .year').html(value.date.year);
					}
					if (today.getTime() < value.date.date_info.getTime()) {
						classToAdd = 'selectable';

					}
					$('tr.weedays th').each(function() {
						const row = $(this);
						if (row.data('weekday') === weekday) {
							column = row.data('column');
							return;
						}
					});
					$($($($('tr.days').get(row)).find('td').get(column)).addClass(classToAdd + ' ' + currentDay).html(day));
					currentDay = '';
					if (column === 6) {
						row++;
					}
				});
			$('td.selectable').click(function() {
				dateClickHandler($(this));
			});
		}
		initCalender(getMonth(new Date()));

		let clickCounter = 0;
		$('.fa-angle-double-right').click(function() {
			$('.right-wrapper').toggleClass('is-active');
			$(this).toggleClass('is-active');
		});

		function dateClickHandler(elem) {

			const day1 = parseInt($(elem).html());
			if (clickCounter === 0) {
				$('td.selectable').each(function() {
					$(this).removeClass('active between hover');
				});
			}
			clickCounter++;
			if (clickCounter === 2) {
				$('td.selectable').each(function() {
					$(this).unbind('mouseenter').unbind('mouseleave');
				});
				clickCounter = 0;
				return;
			}
			$(elem).toggleClass('active');
			$('td.selectable').hover(function() {

				const day2 = parseInt($(this).html());
				$(this).addClass('hover');
				$('td.selectable').each(function() {
					$(this).removeClass('between');

				});
				if (day1 > day2 + 1) {
					$('td.selectable').each(function() {
						const dayBetween = parseInt($(this).html());
						if (dayBetween > day2 && dayBetween < day1) {
							$(this).addClass('between');
						}
					});
				} else if (day1 < day2 + 1) {
					$('td.selectable').each(function() {
						const dayBetween = parseInt($(this).html());
						if (dayBetween > day1 && dayBetween < day2) {
							$(this).addClass('between');
						}
					});
				}
			}, function() {
				$(this).removeClass('hover');
			});
		}
		$('.calendar__left-arrow').click(() => {
			getPrevMonth();
		});

		$('.calendar__right-arrow').click(() => {
			getNextMonth();
		});
	}
};

export default calendar;

