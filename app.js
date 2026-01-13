        // ICLP Events
        const ICLP_EVENTS = [
            { name: "第5週末", date: "2025-12-13" },
            { name: "ワークデー", date: "2026-01-04" },
            { name: "第6週末", date: "2026-02-07" },
            { name: "ワークデー", date: "2026-03-08" },
            { name: "第7週末", date: "2026-04-11" },
            { name: "第8週末", date: "2026-05-09" },
            { name: "完了セッション", date: "2026-06-19" }
        ];

        const COMPLETION_DATE = "2026-06-19";

        // Data Storage
        let currentDate = new Date();
        let viewDate = new Date();
        let completionState = {
            life: null,
            contribution: null
        };
        let editingDate = null;
        let editCompletionState = {
            life: null,
            contribution: null
        };
        // Weekly commit state
        let weeklyCompletionState = {
            life: null,
            contribution: null
        };

        // Initialize
        document.addEventListener('DOMContentLoaded', function () {
            updateCurrentDate();
            updateCountdown();
            loadDeclarations();
            loadTodayData();
            renderCalendar();
            updateStreakDisplay();
            setupAutoResize();
            initWeeklyCommit();
        });

        // Auto-resize textarea
        function setupAutoResize() {
            document.addEventListener('input', function (e) {
                if (e.target.classList.contains('auto-resize')) {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                }
            });
        }

        // Update Current Date
        function updateCurrentDate() {
            const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const day = currentDate.getDate();
            const weekday = weekdays[currentDate.getDay()];

            document.getElementById('currentDate').textContent =
                `${year}年${month}月${day}日(${weekday})`;
        }

        // Format date for display (M/D)
        function formatDateShort(dateStr) {
            const parts = dateStr.split('-');
            return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
        }

        // Update Countdown
        function updateCountdown() {
            const today = formatDate(currentDate);

            // Find next event
            const nextEvent = ICLP_EVENTS.find(event => event.date >= today);

            if (nextEvent) {
                const daysUntil = calculateDaysDiff(today, nextEvent.date);
                const dateShort = formatDateShort(nextEvent.date);
                document.getElementById('nextEventCountdown').textContent =
                    `${nextEvent.name}まで: あと${daysUntil}日 (${dateShort})`;
            }

            // Days until completion
            const daysUntilCompletion = calculateDaysDiff(today, COMPLETION_DATE);
            const completionDateShort = formatDateShort(COMPLETION_DATE);
            document.getElementById('completionCountdown').textContent =
                `完了日まで: あと${daysUntilCompletion}日 (${completionDateShort})`;
        }

        // Calculate Days Difference
        function calculateDaysDiff(date1, date2) {
            const d1 = new Date(date1);
            const d2 = new Date(date2);
            const diffTime = d2 - d1;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        }

        // Format Date (using local timezone)
        function formatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        // Get Data from LocalStorage
        function getData() {
            try {
                const data = localStorage.getItem('iclpData');
                return data ? JSON.parse(data) : {
                    declaration1: null,
                    dailyCommits: {}
                };
            } catch (e) {
                console.error('Error loading data:', e);
                showToast('データの読み込みに失敗しました', 'error');
                return { declaration1: null, dailyCommits: {} };
            }
        }

        // Save Data to LocalStorage (180日削除ロジックを無効化)
        function saveData(data) {
            try {
                /* // 自動削除ロジックを無効化
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - 180);
                const cutoffStr = formatDate(cutoffDate);

                Object.keys(data.dailyCommits).forEach(date => {
                    if (date < cutoffStr) {
                        delete data.dailyCommits[date];
                    }
                });
                */

                localStorage.setItem('iclpData', JSON.stringify(data));
                return true;
            } catch (e) {
                console.error('Error saving data:', e);
                showToast('データの保存に失敗しました', 'error');
                return false;
            }
        }

        // Load Declarations
        function loadDeclarations() {
            const data = getData();
            const today = formatDate(currentDate);

            // Load Declaration 1
            const textEl = document.getElementById('declaration1Text');

            if (data.declaration1) {
                textEl.textContent = data.declaration1.text;
            } else {
                textEl.innerHTML = '私たちICLP25は<br>【愛と感謝で無限の可能性】を貢献するリーダーのチームです';
            }

            // Load Declaration 2
            const declaration2TextEl = document.getElementById('declaration2Text');
            if (data.declaration2) {
                // Replace __ with input field
                let text = data.declaration2.replace('__', '<input type="text" class="declaration-input" id="heroContribution">');
                text = text.replace('__', '<input type="text" class="declaration-input" id="handOver">');
                declaration2TextEl.innerHTML = text;
            } else {
                // Default text
                const defaultText = '＜英雄としての宣言＞\n私は誰かというと、\n私はICLP25に<input type="text" class="declaration-input" id="heroContribution">を貢献するリーダーです。\n手放すものは、<input type="text" class="declaration-input" id="handOver">です。\nこれが私です。';
                declaration2TextEl.innerHTML = defaultText;
            }
        }

        // Open Declaration Settings
        function openDeclarationSettings() {
            const data = getData();

            // Load Declaration 1
            if (data.declaration1) {
                document.getElementById('currentDeclaration1TextDisplay').textContent =
                    data.declaration1.text;
                document.getElementById('declaration1Input').value = data.declaration1.text;
            } else {
                document.getElementById('currentDeclaration1TextDisplay').innerHTML = '私たちICLP25は<br>【愛と感謝で無限の可能性】を貢献するリーダーのチームです';
                document.getElementById('declaration1Input').value = '私たちICLP25は\n【愛と感謝で無限の可能性】を貢献するリーダーのチームです';
            }

            // Load Declaration 2
            if (data.declaration2) {
                document.getElementById('currentDeclaration2TextDisplay').textContent = data.declaration2;
                document.getElementById('declaration2Input').value = data.declaration2;
            } else {
                const defaultDeclaration2 = '＜英雄としての宣言＞\n私は誰かというと、\n私はICLP25に__を貢献するリーダーです。\n手放すものは、__です。\nこれが私です。';
                document.getElementById('currentDeclaration2TextDisplay').textContent = defaultDeclaration2;
                document.getElementById('declaration2Input').value = defaultDeclaration2;
            }

            document.getElementById('declarationModal').classList.add('show');
        }

        // Close Declaration Settings
        function closeDeclarationSettings() {
            document.getElementById('declarationModal').classList.remove('show');
        }

        // Save Declarations
        function saveDeclarations() {
            const text = document.getElementById('declaration1Input').value.trim();
            const declaration2Text = document.getElementById('declaration2Input').value.trim();

            if (!text) {
                showToast('宣言1の内容を入力してください', 'error');
                return;
            }

            if (!declaration2Text) {
                showToast('宣言2の内容を入力してください', 'error');
                return;
            }

            if (!declaration2Text.includes('__')) {
                showToast('宣言2には「__」（アンダースコア2つ）を含めてください', 'error');
                return;
            }

            const data = getData();
            data.declaration1 = {
                text: text,
                updatedAt: new Date().toISOString()
            };
            data.declaration2 = declaration2Text;

            if (saveData(data)) {
                loadDeclarations();
                closeDeclarationSettings();
                showToast('宣言を保存しました!', 'success');
            }
        }



        // Add Life Commit
        function addLifeCommit() {
            const list = document.getElementById('lifeCommitList');
            const newItem = document.createElement('div');
            newItem.className = 'commit-item';
            newItem.innerHTML = `
                <textarea class="input-field auto-resize"></textarea>
                <button class="btn-remove" onclick="removeLifeCommit(this)">削除</button>
            `;
            list.appendChild(newItem);
        }

        // Remove Life Commit
        function removeLifeCommit(button) {
            const list = document.getElementById('lifeCommitList');
            if (list.children.length > 1) {
                button.parentElement.remove();
            } else {
                showToast('最低1つのコミットは必要です', 'error');
            }
        }

        // Load Today's Data
        function loadTodayData() {
            const data = getData();
            const todayKey = formatDate(currentDate);
            const todayData = data.dailyCommits[todayKey];
            const completionSection = document.getElementById('dailyCompletionSection');

            if (todayData) {
                // handOver input may not exist yet if loadDeclarations hasn't run
                const handOverInput = document.getElementById('handOver');

                if (handOverInput) {
                    handOverInput.value = todayData.handOver || '';
                }
                const heroContributionInput = document.getElementById('heroContribution');
                if (heroContributionInput) {
                    heroContributionInput.value = todayData.heroContribution || '';
                }

                // 貢献のコミット - 新形式と旧形式に対応
                if (todayData.contributionContent) {
                    document.getElementById('contributionContent').value = todayData.contributionContent;
                } else if (todayData.contributionWho || todayData.contributionIntent) {
                    // 旧データがある場合は統合して表示
                    const who = todayData.contributionWho || '';
                    const intent = todayData.contributionIntent || '';
                    document.getElementById('contributionContent').value = who && intent ? `${who}\n${intent}` : (who || intent);
                } else {
                    document.getElementById('contributionContent').value = '';
                }

                // Load life commits
                const list = document.getElementById('lifeCommitList');
                list.innerHTML = '';

                if (todayData.lifeCommit && todayData.lifeCommit.length > 0) {
                    todayData.lifeCommit.forEach((commit, index) => {
                        const item = document.createElement('div');
                        item.className = 'commit-item';
                        item.innerHTML = `
                            <textarea class="input-field auto-resize">${commit}</textarea>
                            ${index > 0 ? '<button class="btn-remove" onclick="removeLifeCommit(this)">削除</button>' : ''}
                        `;
                        list.appendChild(item);
                    });
                } else {
                    list.innerHTML = `
                        <div class="commit-item">
                            <textarea class="input-field auto-resize"></textarea>
                        </div>
                    `;
                }

                // Load completion state
                if (todayData.lifeCompleted !== undefined) {
                    completionState.life = todayData.lifeCompleted;
                    updateCompletionButton('life', todayData.lifeCompleted);
                }

                if (todayData.contributionCompleted !== undefined) {
                    completionState.contribution = todayData.contributionCompleted;
                    updateCompletionButton('contribution', todayData.contributionCompleted);
                }

                // Show completion section if commits exist
                if (todayData.lifeCommit && todayData.lifeCommit.length > 0) {
                    completionSection.style.display = 'block';
                }
            } else {
                completionSection.style.display = 'none';
            }
        }

        // Save Commits
        function saveCommits() {
            const handOver = document.getElementById('handOver').value.trim();
            const heroContribution = document.getElementById('heroContribution') ? document.getElementById('heroContribution').value.trim() : '';
            const contributionContent = document.getElementById('contributionContent').value.trim();

            // Collect life commits
            const lifeCommits = [];
            document.querySelectorAll('#lifeCommitList textarea').forEach(textarea => {
                const value = textarea.value.trim();
                if (value) {
                    lifeCommits.push(value);
                }
            });

            if (lifeCommits.length === 0) {
                showToast('最低1つの人生のコミットを入力してください', 'error');
                return;
            }

            const data = getData();
            const todayKey = formatDate(currentDate);

            if (!data.dailyCommits[todayKey]) {
                data.dailyCommits[todayKey] = {};
            }

            data.dailyCommits[todayKey].handOver = handOver;
            data.dailyCommits[todayKey].heroContribution = heroContribution;
            data.dailyCommits[todayKey].lifeCommit = lifeCommits;
            data.dailyCommits[todayKey].contributionContent = contributionContent;
            data.dailyCommits[todayKey].timestamp = new Date().toISOString();

            if (saveData(data)) {
                showToast('コミットを保存しました!', 'success');
                renderCalendar();
                // Show completion section
                document.getElementById('dailyCompletionSection').style.display = 'block';
            }
        }

        // Set Completion
        function setCompletion(type, value) {
            completionState[type] = value;
            updateCompletionButton(type, value);
        }

        // Update Completion Button
        function updateCompletionButton(type, value) {
            const section = document.getElementById('dailyCompletionSection');
            const completionItems = section.querySelectorAll('.completion-item');
            const targetItem = type === 'life' ? completionItems[0] : completionItems[1];
            const buttons = targetItem.querySelectorAll('.completion-btn');

            buttons.forEach(btn => {
                btn.classList.remove('selected-yes', 'selected-no');
            });

            if (value === true) {
                buttons[0].classList.add('selected-yes');
            } else if (value === false) {
                buttons[1].classList.add('selected-no');
            }
        }

        // Show Breakdown Modal
        function showBreakdownModal() {
            document.getElementById('breakdownModal').classList.add('show');
        }

        // Close Breakdown Modal
        function closeBreakdownModal() {
            document.getElementById('breakdownModal').classList.remove('show');
        }

        // Save Completion
        function saveCompletion() {
            if (completionState.life === null || completionState.contribution === null) {
                showToast('両方の完了状態を選択してください', 'error');
                return;
            }

            const data = getData();
            const todayKey = formatDate(currentDate);

            if (!data.dailyCommits[todayKey] || !data.dailyCommits[todayKey].lifeCommit) {
                showToast('先にコミットを保存してください', 'error');
                return;
            }

            // データを先に保存
            data.dailyCommits[todayKey].lifeCompleted = completionState.life;
            data.dailyCommits[todayKey].contributionCompleted = completionState.contribution;
            data.dailyCommits[todayKey].completionTimestamp = new Date().toISOString();

            if (saveData(data)) {
                // 保存成功後、「やらなかった」があればブレイクダウン宣言を表示
                const needsBreakdown = (completionState.life === false || completionState.contribution === false);
                const breakdownKey = `breakdown_${todayKey}`;
                const breakdownShown = localStorage.getItem(breakdownKey);

                if (needsBreakdown) {
                    // モーダル表示 (毎回表示する)
                    showBreakdownModal();
                } else {
                    // ブレイクダウン不要な場合は通常のトースト表示
                    showToast('完了を記録しました!', 'success');
                }

                renderCalendar();
                updateStreakDisplay();
            }
        }

        // Update Streak Display
        function updateStreakDisplay() {
            const data = getData();
            const today = formatDate(currentDate);

            let currentStreak = 0;
            let maxStreak = 0;
            let tempStreak = 0;

            // Sort dates
            const sortedDates = Object.keys(data.dailyCommits).sort();

            // Calculate streaks
            for (let i = 0; i < sortedDates.length; i++) {
                const dateKey = sortedDates[i];
                const dayData = data.dailyCommits[dateKey];

                // 完了記録済みならカウント（やった/やらなかった問わず）
                if (dayData.lifeCompleted !== undefined && dayData.contributionCompleted !== undefined) {
                    tempStreak++;
                    maxStreak = Math.max(maxStreak, tempStreak);

                    // Check if this is part of current streak
                    if (i === sortedDates.length - 1 || sortedDates[i + 1] > today) {
                        // Calculate days from this date to today
                        const daysDiff = calculateDaysDiff(dateKey, today);
                        if (daysDiff <= 1) {
                            currentStreak = tempStreak;
                        }
                    }
                } else {
                    tempStreak = 0;
                }
            }

            document.getElementById('currentStreak').textContent = `連続: ${currentStreak}日`;
            document.getElementById('maxStreak').textContent = `最長: ${maxStreak}日`;
        }

        // Calendar Functions
        function changeMonth(direction) {
            viewDate.setMonth(viewDate.getMonth() + direction);
            renderCalendar();
        }

        function renderCalendar() {
            const year = viewDate.getFullYear();
            const month = viewDate.getMonth();

            document.getElementById('calendarMonth').textContent =
                `${year}年${month + 1}月`;

            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startDayOfWeek = (firstDay.getDay() + 1) % 7;

            const calendarDays = document.getElementById('calendarDays');
            calendarDays.innerHTML = '';

            // Empty cells before first day
            for (let i = 0; i < startDayOfWeek; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'calendar-day empty';
                calendarDays.appendChild(emptyDay);
            }

            // Days of month
            const data = getData();
            const today = formatDate(currentDate);
            let monthTotal = 0;

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dateKey = formatDate(date);
                const dayData = data.dailyCommits[dateKey];
                const dayOfWeek = date.getDay();
                const isFuture = dateKey > today;

                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';

                if (isFuture) {
                    dayElement.classList.add('future');
                } else if (dateKey === today) {
                    dayElement.classList.add('today');
                }

                if (dayOfWeek === 0) {
                    dayElement.classList.add('sunday');
                } else if (dayOfWeek === 6) {
                    dayElement.classList.add('saturday');
                }

                // Create day number
                const dayNumber = document.createElement('div');
                dayNumber.className = 'calendar-day-number';
                dayNumber.textContent = day;
                dayElement.appendChild(dayNumber);

                // Determine day status - Show 👑 for やった
                if (!isFuture) {
                    const hasDailyComplete = dayData && dayData.lifeCompleted !== undefined && dayData.contributionCompleted !== undefined;

                    // Check for weekly commit completion (only on Saturdays)
                    let hasWeeklyComplete = false;
                    if (dayOfWeek === 6 && data.weeklyCommits) {
                        const weeklyData = data.weeklyCommits[dateKey];
                        if (weeklyData && weeklyData.lifeCompleted !== undefined && weeklyData.contributionCompleted !== undefined) {
                            hasWeeklyComplete = true;
                        }
                    }

                    if (hasDailyComplete || hasWeeklyComplete) {
                        const mark = document.createElement('div');
                        mark.className = 'calendar-day-mark';

                        // Count crowns for daily commits
                        let dailyCrowns = 0;
                        if (dayData && dayData.lifeCompleted === true) dailyCrowns++;
                        if (dayData && dayData.contributionCompleted === true) dailyCrowns++;

                        // Display based on crowns earned
                        if (dailyCrowns === 2) {
                            mark.textContent = '👑👑';
                            mark.classList.add('crown-both');
                        } else if (dailyCrowns === 1) {
                            mark.textContent = '👑';
                            mark.classList.add('crown-one');
                        } else {
                            mark.textContent = '○';
                        }

                        // Add weekly indicator for Saturdays
                        if (hasWeeklyComplete) {
                            const weeklyMark = document.createElement('div');
                            weeklyMark.className = 'calendar-day-mark weekly';
                            weeklyMark.textContent = '★';
                            dayElement.appendChild(weeklyMark);
                        }

                        dayElement.appendChild(mark);
                        if (hasDailyComplete) monthTotal++;
                    }
                }

                if (!isFuture) {
                    dayElement.onclick = () => showDayDetail(dateKey);
                }
                calendarDays.appendChild(dayElement);
            }

            // Update total and rate
            const passedDays = Math.min(daysInMonth, today.split('-')[1] == (month + 1) ? parseInt(today.split('-')[2]) : daysInMonth);
            document.getElementById('calendarTotal').textContent = `完了: ${monthTotal}日`;
            document.getElementById('calendarRate').textContent = `${passedDays}日`;
        }

        function showDayDetail(dateKey) {
            const data = getData();
            const dayData = data.dailyCommits[dateKey];

            // Check if clicked date is a Saturday
            // Parse date string manually to avoid timezone issues
            const parts = dateKey.split('-');
            const clickedDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            const isSaturdayDate = clickedDate.getDay() === 6;

            if (isSaturdayDate) {
                // Open weekly commit edit modal for Saturdays
                openEditWeeklyModal(dateKey);
                return;
            }

            if (!dayData) {
                // No data - open edit modal
                editingDate = dateKey;
                openEditDayModal(dateKey, null);
                return;
            }

            // Open edit modal with existing data
            editingDate = dateKey;
            openEditDayModal(dateKey, dayData);
        }

        // Open Edit Day Modal
        function openEditDayModal(dateKey, dayData) {
            document.getElementById('editDateDisplay').textContent = dateKey;

            if (dayData) {
                document.getElementById('editHandOver').value = dayData.handOver || '';
                document.getElementById('editHeroContribution').value = dayData.heroContribution || '';

                // 貢献のコミット - 新形式と旧形式に対応
                if (dayData.contributionContent) {
                    document.getElementById('editContributionContent').value = dayData.contributionContent;
                } else if (dayData.contributionWho || dayData.contributionIntent) {
                    // 旧データがある場合は統合して表示
                    const who = dayData.contributionWho || '';
                    const intent = dayData.contributionIntent || '';
                    document.getElementById('editContributionContent').value = who && intent ? `${who}\n${intent}` : (who || intent);
                } else {
                    document.getElementById('editContributionContent').value = '';
                }

                // Load life commits
                const list = document.getElementById('editLifeCommitList');
                list.innerHTML = '';

                if (dayData.lifeCommit && dayData.lifeCommit.length > 0) {
                    dayData.lifeCommit.forEach(commit => {
                        const item = document.createElement('div');
                        item.className = 'commit-item';
                        item.innerHTML = `
                            <textarea class="input-field auto-resize">${commit}</textarea>
                        `;
                        list.appendChild(item);
                    });
                } else {
                    list.innerHTML = `
                        <div class="commit-item">
                            <textarea class="input-field auto-resize"></textarea>
                        </div>
                    `;
                }

                // Set completion state
                editCompletionState.life = dayData.lifeCompleted !== undefined ? dayData.lifeCompleted : null;
                editCompletionState.contribution = dayData.contributionCompleted !== undefined ? dayData.contributionCompleted : null;

                updateEditCompletionButton('life', editCompletionState.life);
                updateEditCompletionButton('contribution', editCompletionState.contribution);
            } else {
                // New entry
                document.getElementById('editHandOver').value = '';
                document.getElementById('editHeroContribution').value = '';
                document.getElementById('editContributionContent').value = '';

                const list = document.getElementById('editLifeCommitList');
                list.innerHTML = `
                    <div class="commit-item">
                        <textarea class="input-field auto-resize"></textarea>
                    </div>
                `;

                editCompletionState = { life: null, contribution: null };
                updateEditCompletionButton('life', null);
                updateEditCompletionButton('contribution', null);
            }

            document.getElementById('editDayModal').classList.add('show');
        }

        // Close Edit Day Modal
        function closeEditDayModal() {
            document.getElementById('editDayModal').classList.remove('show');
            editingDate = null;
        }

        // Set Edit Completion
        function setEditCompletion(type, value) {
            editCompletionState[type] = value;
            updateEditCompletionButton(type, value);
        }

        // Update Edit Completion Button
        function updateEditCompletionButton(type, value) {
            const modal = document.getElementById('editDayModal');
            const completionItems = modal.querySelectorAll('.completion-item');
            const targetItem = type === 'life' ? completionItems[0] : completionItems[1];
            const buttons = targetItem.querySelectorAll('.completion-btn');

            buttons.forEach(btn => {
                btn.classList.remove('selected-yes', 'selected-no');
            });

            if (value === true) {
                buttons[0].classList.add('selected-yes');
            } else if (value === false) {
                buttons[1].classList.add('selected-no');
            }
        }

        // Save Edited Day
        function saveEditedDay() {
            const handOver = document.getElementById('editHandOver').value.trim();
            const heroContribution = document.getElementById('editHeroContribution').value.trim();
            const contributionContent = document.getElementById('editContributionContent').value.trim();

            // Collect life commits
            const lifeCommits = [];
            document.querySelectorAll('#editLifeCommitList textarea').forEach(textarea => {
                const value = textarea.value.trim();
                if (value) {
                    lifeCommits.push(value);
                }
            });

            if (lifeCommits.length === 0) {
                showToast('最低1つの人生のコミットを入力してください', 'error');
                return;
            }

            const data = getData();

            if (!data.dailyCommits[editingDate]) {
                data.dailyCommits[editingDate] = {};
            }

            data.dailyCommits[editingDate].handOver = handOver;
            data.dailyCommits[editingDate].heroContribution = heroContribution;
            data.dailyCommits[editingDate].lifeCommit = lifeCommits;
            data.dailyCommits[editingDate].contributionContent = contributionContent;

            if (editCompletionState.life !== null) {
                data.dailyCommits[editingDate].lifeCompleted = editCompletionState.life;
            }
            if (editCompletionState.contribution !== null) {
                data.dailyCommits[editingDate].contributionCompleted = editCompletionState.contribution;
            }

            data.dailyCommits[editingDate].timestamp = new Date().toISOString();

            if (saveData(data)) {
                showToast('記録を保存しました!', 'success');
                closeEditDayModal();
                renderCalendar();
                updateStreakDisplay();

                // Reload today's data if editing today
                if (editingDate === formatDate(currentDate)) {
                    loadTodayData();
                }
            }
        }

        // Toast
        function showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = 'toast show ' + type;

            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        // =====================================
        // Weekly Commit Functions
        // =====================================

        // Get week info (start Saturday, end Friday)
        function getWeekInfo(date) {
            const d = new Date(date);
            const dayOfWeek = d.getDay();

            // Find the Saturday of this week (week starts on Saturday)
            let saturdayOffset;
            if (dayOfWeek === 6) {
                // It's Saturday, this is the start
                saturdayOffset = 0;
            } else {
                // Go back to previous Saturday
                saturdayOffset = -(dayOfWeek + 1);
            }

            const saturday = new Date(d);
            saturday.setDate(d.getDate() + saturdayOffset);

            const friday = new Date(saturday);
            friday.setDate(saturday.getDate() + 6);

            return {
                startDate: formatDate(saturday),
                endDate: formatDate(friday),
                startDateObj: saturday,
                endDateObj: friday
            };
        }

        // Check if today is Saturday
        function isSaturday() {
            return currentDate.getDay() === 6;
        }

        // Check if today is Friday
        function isFriday() {
            return currentDate.getDay() === 5;
        }

        // Usage Modal Functions
        function openUsageModal() {
            document.getElementById('usageModal').classList.add('show');
        }

        function closeUsageModal() {
            document.getElementById('usageModal').classList.remove('show');
        }

        // Export Modal Functions
        function openExportModal() {
            document.getElementById('exportModal').classList.add('show');
        }

        function closeExportModal() {
            document.getElementById('exportModal').classList.remove('show');
        }

        // Copy All Data (TSV for Spreadsheets)
        function copyAllData() {
            const data = getData();
            const allDates = Object.keys(data.dailyCommits).sort();

            if (allDates.length === 0) {
                showToast('データがありません', 'error');
                return;
            }

            // Header
            let tsvContent = "日付\t宣言1\t宣言2(Full)\t手放すもの\t貢献するもの\t人生のコミット\t貢献のコミット(内容)\t人生完了\t貢献完了\n";

            allDates.forEach(date => {
                const d = data.dailyCommits[date];

                // Format Declaration 2
                let dec2 = "";
                if (d.heroContribution && d.handOver) {
                    dec2 = `私はICLP25に${d.heroContribution}を貢献するリーダーです。手放すものは、${d.handOver}です。これが私です。`;
                }

                const lifeCommits = d.lifeCommit ? d.lifeCommit.join(" / ") : "";
                const contribution = d.contributionContent ? d.contributionContent.replace(/\n/g, " ") : "";

                const lifeStatus = d.lifeCompleted === true ? "完了" : (d.lifeCompleted === false ? "未完了" : "-");
                const contStatus = d.contributionCompleted === true ? "完了" : (d.contributionCompleted === false ? "未完了" : "-");

                const row = [
                    date,
                    data.declaration1 ? data.declaration1.text.replace(/\n/g, " ") : "",
                    dec2,
                    d.handOver || "",
                    d.heroContribution || "",
                    lifeCommits,
                    contribution,
                    lifeStatus,
                    contStatus
                ].map(field => String(field).replace(/\t/g, " ")).join("\t");

                tsvContent += row + "\n";
            });

            // Copy
            if (navigator.clipboard) {
                navigator.clipboard.writeText(tsvContent).then(() => {
                    alert("全データをコピーしました！\n\nGoogleスプレッドシートアプリを開いて\nA1セルを選択して「貼り付け」してください。");
                }).catch(err => {
                    showToast('コピーに失敗しました', 'error');
                });
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = tsvContent;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert("全データをコピーしました！\n\nGoogleスプレッドシートアプリを開いて\nA1セルを選択して「貼り付け」してください。");
            }
        }

        // Format date for display (M/D)
        function formatDateDisplay(dateStr) {
            const parts = dateStr.split('-');
            return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
        }

        // Initialize Weekly Commit Logic
        function initWeeklyCommit() {
            const weekInfo = getWeekInfo(currentDate);
            const dayOfWeek = currentDate.getDay();

            // Reset displays
            document.getElementById('weeklyCommitInputSection').style.display = 'none';
            document.getElementById('weeklyCompletionSection').style.display = 'none';

            if (dayOfWeek === 6) { // Saturday
                showWeeklyInputSection(weekInfo);
            } else if (dayOfWeek === 5) { // Friday
                showWeeklyCompletionSection(weekInfo);
            }

            // Always show weekly commit in header if exists
            loadWeeklyCommitToHeader();
        }

        // Show weekly commit input section (Saturday)
        function showWeeklyInputSection(weekInfo) {
            const section = document.getElementById('weeklyCommitInputSection');
            const badge = document.getElementById('weeklyPeriodBadge');

            badge.textContent = `${formatDateShort(weekInfo.startDate)}〜${formatDateShort(weekInfo.endDate)}`;
            section.style.display = 'block';

            // Load existing weekly commit if any
            const data = getData();
            const weeklyData = data.weeklyCommits && data.weeklyCommits[weekInfo.startDate];

            if (weeklyData) {
                // Load existing data
                const list = document.getElementById('weeklyLifeCommitList');
                list.innerHTML = '';

                if (weeklyData.lifeCommit && weeklyData.lifeCommit.length > 0) {
                    weeklyData.lifeCommit.forEach((commit, index) => {
                        const item = document.createElement('div');
                        item.className = 'commit-item';
                        item.innerHTML = `
                            <textarea class="input-field auto-resize">${commit}</textarea>
                            ${index > 0 ? '<button class="btn-remove" onclick="removeWeeklyLifeCommit(this)">削除</button>' : ''}
                        `;
                        list.appendChild(item);
                    });
                }

                document.getElementById('weeklyContributionContent').value = weeklyData.contributionContent || '';
            }
        }

        // Show weekly completion section (Friday)
        function showWeeklyCompletionSection(weekInfo) {
            const section = document.getElementById('weeklyCompletionSection');
            const badge = document.getElementById('weeklyCompletionPeriodBadge');

            badge.textContent = `${formatDateShort(weekInfo.startDate)}〜${formatDateShort(weekInfo.endDate)}`;

            // Load weekly commit data
            const data = getData();
            const weeklyData = data.weeklyCommits && data.weeklyCommits[weekInfo.startDate];

            if (weeklyData) {
                // Display life commits
                const lifeDisplay = document.getElementById('weeklyLifeCommitDisplay');
                if (weeklyData.lifeCommit && weeklyData.lifeCommit.length > 0) {
                    lifeDisplay.textContent = weeklyData.lifeCommit.join('\n');
                } else {
                    lifeDisplay.textContent = '未設定';
                }

                // Display contribution commit
                const contributionDisplay = document.getElementById('weeklyContributionDisplay');
                contributionDisplay.textContent = weeklyData.contributionContent || '未設定';

                // Load completion state if already saved
                if (weeklyData.lifeCompleted !== undefined) {
                    weeklyCompletionState.life = weeklyData.lifeCompleted;
                    updateWeeklyCompletionButton('life', weeklyData.lifeCompleted);
                }
                if (weeklyData.contributionCompleted !== undefined) {
                    weeklyCompletionState.contribution = weeklyData.contributionCompleted;
                    updateWeeklyCompletionButton('contribution', weeklyData.contributionCompleted);
                }

                section.style.display = 'block';
            } else {
                // No weekly commit for this week
                document.getElementById('weeklyLifeCommitDisplay').textContent = '今週の週間コミットはまだ設定されていません';
                document.getElementById('weeklyContributionDisplay').textContent = '土曜日に週間コミットを設定してください';
                section.style.display = 'block';
            }
        }

        // Load weekly commit to header (Fixed logic)
        function loadWeeklyCommitToHeader() {
            try {
                // DOM Elements
                const lifeTextEl = document.getElementById('weeklyCommitHeaderTextLife');
                const contributionTextEl = document.getElementById('weeklyCommitHeaderTextContribution');

                if (!lifeTextEl || !contributionTextEl) return;

                // Date & Week Info
                const weekInfo = getWeekInfo(currentDate);

                // 日付計算を文字列ベースに変更し、タイムゾーンのズレやエラーを防ぐ
                const dateParts = weekInfo.startDate.split('-');
                const month = parseInt(dateParts[1]);
                const day = parseInt(dateParts[2]);

                // 曜日を計算するためにDateオブジェクトを作成（時間は0:0:0）
                const dateForWeekday = new Date(parseInt(dateParts[0]), month - 1, day);
                const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
                const weekday = weekdays[dateForWeekday.getDay()];

                // Base Text
                const unenteredText = `未入力：${month}/${day}(${weekday})`;

                // Retrieve Data
                const data = getData();
                const weeklyData = (data.weeklyCommits && data.weeklyCommits[weekInfo.startDate])
                    ? data.weeklyCommits[weekInfo.startDate]
                    : null;

                // Set Life Commit Text
                if (weeklyData && weeklyData.lifeCommit && weeklyData.lifeCommit.length > 0) {
                    lifeTextEl.textContent = weeklyData.lifeCommit.join(' / ');
                } else {
                    lifeTextEl.textContent = unenteredText;
                }

                // Set Contribution Commit Text
                if (weeklyData && weeklyData.contributionContent) {
                    contributionTextEl.textContent = weeklyData.contributionContent;
                } else {
                    contributionTextEl.textContent = unenteredText;
                }

                // Force Visibility
                const headerContainer = document.getElementById('weeklyCommitHeader');
                if (headerContainer) headerContainer.style.display = 'flex';

            } catch (e) {
                console.error('Header Load Error:', e);
                // エラー時はフォールバック表示
                const lifeTextEl = document.getElementById('weeklyCommitHeaderTextLife');
                const contributionTextEl = document.getElementById('weeklyCommitHeaderTextContribution');
                if (lifeTextEl) lifeTextEl.textContent = "未入力";
                if (contributionTextEl) contributionTextEl.textContent = "未入力";
            }
        }

        // Add weekly life commit input
        function addWeeklyLifeCommit() {
            const list = document.getElementById('weeklyLifeCommitList');
            const newItem = document.createElement('div');
            newItem.className = 'commit-item';
            newItem.innerHTML = `
                <textarea class="input-field auto-resize" placeholder="今週達成したいこと..."></textarea>
                <button class="btn-remove" onclick="removeWeeklyLifeCommit(this)">削除</button>
            `;
            list.appendChild(newItem);
        }

        // Remove weekly life commit input
        function removeWeeklyLifeCommit(button) {
            const list = document.getElementById('weeklyLifeCommitList');
            if (list.children.length > 1) {
                button.parentElement.remove();
            } else {
                showToast('最低1つのコミットは必要です', 'error');
            }
        }

        // Save weekly commits (Saturday)
        function saveWeeklyCommits() {
            const weekInfo = getWeekInfo(currentDate);

            // Collect life commits
            const lifeCommits = [];
            document.querySelectorAll('#weeklyLifeCommitList textarea').forEach(textarea => {
                const value = textarea.value.trim();
                if (value) {
                    lifeCommits.push(value);
                }
            });

            if (lifeCommits.length === 0) {
                showToast('最低1つの人生のコミットを入力してください', 'error');
                return;
            }

            const contributionContent = document.getElementById('weeklyContributionContent').value.trim();

            const data = getData();

            if (!data.weeklyCommits) {
                data.weeklyCommits = {};
            }

            data.weeklyCommits[weekInfo.startDate] = {
                lifeCommit: lifeCommits,
                contributionContent: contributionContent,
                startDate: weekInfo.startDate,
                endDate: weekInfo.endDate,
                timestamp: new Date().toISOString()
            };

            if (saveData(data)) {
                showToast('週間コミットを保存しました!', 'success');
                loadWeeklyCommitToHeader();
                renderCalendar();
            }
        }

        // Set weekly completion state
        function setWeeklyCompletion(type, value) {
            weeklyCompletionState[type] = value;
            updateWeeklyCompletionButton(type, value);
        }

        // Update weekly completion button
        function updateWeeklyCompletionButton(type, value) {
            const section = document.getElementById('weeklyCompletionSection');
            const completionItems = section.querySelectorAll('.completion-item');
            const targetItem = type === 'life' ? completionItems[0] : completionItems[1];
            const buttons = targetItem.querySelectorAll('.completion-btn');

            buttons.forEach(btn => {
                btn.classList.remove('selected-yes', 'selected-no');
            });

            if (value === true) {
                buttons[0].classList.add('selected-yes');
            } else if (value === false) {
                buttons[1].classList.add('selected-no');
            }
        }

        // Save weekly completion (Friday)
        function saveWeeklyCompletion() {
            if (weeklyCompletionState.life === null || weeklyCompletionState.contribution === null) {
                showToast('両方の完了状態を選択してください', 'error');
                return;
            }

            const weekInfo = getWeekInfo(currentDate);
            const data = getData();

            if (!data.weeklyCommits || !data.weeklyCommits[weekInfo.startDate]) {
                showToast('週間コミットが設定されていません', 'error');
                return;
            }

            data.weeklyCommits[weekInfo.startDate].lifeCompleted = weeklyCompletionState.life;
            data.weeklyCommits[weekInfo.startDate].contributionCompleted = weeklyCompletionState.contribution;
            data.weeklyCommits[weekInfo.startDate].completedAt = new Date().toISOString();

            if (saveData(data)) {
                // Check if breakdown is needed
                const needsBreakdown = (weeklyCompletionState.life === false || weeklyCompletionState.contribution === false);
                const breakdownKey = `weekly_breakdown_${weekInfo.startDate}`;
                const breakdownShown = localStorage.getItem(breakdownKey);

                if (needsBreakdown && !breakdownShown) {
                    localStorage.setItem(breakdownKey, 'true');
                    showBreakdownModal();
                } else {
                    showToast('週間の完了を記録しました!', 'success');
                }

                renderCalendar();
            }
        }

        // =====================================
        // Edit Weekly Commit Modal Functions
        // =====================================

        let editingWeeklyDate = null;
        let editWeeklyCompletionState = {
            life: null,
            contribution: null
        };

        // Open weekly commit edit modal
        function openEditWeeklyModal(saturdayDateKey) {
            editingWeeklyDate = saturdayDateKey;
            const weekInfo = getWeekInfo(new Date(saturdayDateKey));

            // Set date display
            document.getElementById('editWeeklyDateDisplay').textContent =
                `${formatDateDisplay(weekInfo.startDate)}(土)〜${formatDateDisplay(weekInfo.endDate)}(金)`;

            // Load existing data
            const data = getData();
            const weeklyData = data.weeklyCommits && data.weeklyCommits[saturdayDateKey];

            const list = document.getElementById('editWeeklyLifeCommitList');
            list.innerHTML = '';

            if (weeklyData) {
                // Load existing weekly commit
                if (weeklyData.lifeCommit && weeklyData.lifeCommit.length > 0) {
                    weeklyData.lifeCommit.forEach((commit, index) => {
                        const item = document.createElement('div');
                        item.className = 'commit-item';
                        item.innerHTML = `
                            <textarea class="input-field auto-resize">${commit}</textarea>
                            ${index > 0 ? '<button class="btn-remove" onclick="removeEditWeeklyLifeCommit(this)">削除</button>' : ''}
                        `;
                        list.appendChild(item);
                    });
                } else {
                    addDefaultEditWeeklyCommitItem(list);
                }

                document.getElementById('editWeeklyContributionContent').value = weeklyData.contributionContent || '';

                // Load completion state
                editWeeklyCompletionState.life = weeklyData.lifeCompleted !== undefined ? weeklyData.lifeCompleted : null;
                editWeeklyCompletionState.contribution = weeklyData.contributionCompleted !== undefined ? weeklyData.contributionCompleted : null;
            } else {
                // New entry
                addDefaultEditWeeklyCommitItem(list);
                document.getElementById('editWeeklyContributionContent').value = '';
                editWeeklyCompletionState = { life: null, contribution: null };
            }

            updateEditWeeklyCompletionButton('life', editWeeklyCompletionState.life);
            updateEditWeeklyCompletionButton('contribution', editWeeklyCompletionState.contribution);

            document.getElementById('editWeeklyModal').classList.add('show');
        }

        // Add default commit item for edit modal
        function addDefaultEditWeeklyCommitItem(list) {
            const item = document.createElement('div');
            item.className = 'commit-item';
            item.innerHTML = `<textarea class="input-field auto-resize" placeholder="今週達成したいこと..."></textarea>`;
            list.appendChild(item);
        }

        // Close weekly edit modal
        function closeEditWeeklyModal() {
            document.getElementById('editWeeklyModal').classList.remove('show');
            editingWeeklyDate = null;
        }

        // Add life commit in edit modal
        function addEditWeeklyLifeCommit() {
            const list = document.getElementById('editWeeklyLifeCommitList');
            const newItem = document.createElement('div');
            newItem.className = 'commit-item';
            newItem.innerHTML = `
                <textarea class="input-field auto-resize" placeholder="今週達成したいこと..."></textarea>
                <button class="btn-remove" onclick="removeEditWeeklyLifeCommit(this)">削除</button>
            `;
            list.appendChild(newItem);
        }

        // Remove life commit in edit modal
        function removeEditWeeklyLifeCommit(button) {
            const list = document.getElementById('editWeeklyLifeCommitList');
            if (list.children.length > 1) {
                button.parentElement.remove();
            } else {
                showToast('最低1つのコミットは必要です', 'error');
            }
        }

        // Set completion state in edit modal
        function setEditWeeklyCompletion(type, value) {
            editWeeklyCompletionState[type] = value;
            updateEditWeeklyCompletionButton(type, value);
        }

        // Update completion button in edit modal
        function updateEditWeeklyCompletionButton(type, value) {
            const modal = document.getElementById('editWeeklyModal');
            const completionItems = modal.querySelectorAll('.completion-item');
            const targetItem = type === 'life' ? completionItems[0] : completionItems[1];
            const buttons = targetItem.querySelectorAll('.completion-btn');

            buttons.forEach(btn => {
                btn.classList.remove('selected-yes', 'selected-no');
            });

            if (value === true) {
                buttons[0].classList.add('selected-yes');
            } else if (value === false) {
                buttons[1].classList.add('selected-no');
            }
        }

        // Save edited weekly commit
        function saveEditedWeeklyCommit() {
            // Collect life commits
            const lifeCommits = [];
            document.querySelectorAll('#editWeeklyLifeCommitList textarea').forEach(textarea => {
                const value = textarea.value.trim();
                if (value) {
                    lifeCommits.push(value);
                }
            });

            if (lifeCommits.length === 0) {
                showToast('最低1つの人生のコミットを入力してください', 'error');
                return;
            }

            const contributionContent = document.getElementById('editWeeklyContributionContent').value.trim();
            const weekInfo = getWeekInfo(new Date(editingWeeklyDate));

            const data = getData();

            if (!data.weeklyCommits) {
                data.weeklyCommits = {};
            }

            // Preserve existing data or create new
            if (!data.weeklyCommits[editingWeeklyDate]) {
                data.weeklyCommits[editingWeeklyDate] = {};
            }

            data.weeklyCommits[editingWeeklyDate].lifeCommit = lifeCommits;
            data.weeklyCommits[editingWeeklyDate].contributionContent = contributionContent;
            data.weeklyCommits[editingWeeklyDate].startDate = weekInfo.startDate;
            data.weeklyCommits[editingWeeklyDate].endDate = weekInfo.endDate;
            data.weeklyCommits[editingWeeklyDate].timestamp = new Date().toISOString();

            // Save completion state if set
            if (editWeeklyCompletionState.life !== null) {
                data.weeklyCommits[editingWeeklyDate].lifeCompleted = editWeeklyCompletionState.life;
            }
            if (editWeeklyCompletionState.contribution !== null) {
                data.weeklyCommits[editingWeeklyDate].contributionCompleted = editWeeklyCompletionState.contribution;
            }
            if (editWeeklyCompletionState.life !== null || editWeeklyCompletionState.contribution !== null) {
                data.weeklyCommits[editingWeeklyDate].completedAt = new Date().toISOString();
            }

            if (saveData(data)) {
                showToast('週間コミットを保存しました!', 'success');
                closeEditWeeklyModal();
                renderCalendar();
                loadWeeklyCommitToHeader();
            }
        }

        // =====================================
        // Saturday Modal Tab & Daily Functions
        // =====================================

        let editSaturdayCompletionState = {
            life: null,
            contribution: null
        };

        // Switch Saturday modal tab
        function switchSaturdayTab(tab) {
            const tabWeekly = document.getElementById('tabWeekly');
            const tabDaily = document.getElementById('tabDaily');
            const pageWeekly = document.getElementById('pageWeekly');
            const pageDaily = document.getElementById('pageDaily');

            if (tab === 'weekly') {
                tabWeekly.classList.add('active');
                tabDaily.classList.remove('active');
                pageWeekly.classList.add('active');
                pageDaily.classList.remove('active');
            } else {
                tabWeekly.classList.remove('active');
                tabDaily.classList.add('active');
                pageWeekly.classList.remove('active');
                pageDaily.classList.add('active');
            }
        }

        // Update openEditWeeklyModal to also load daily data
        const originalOpenEditWeeklyModal = openEditWeeklyModal;
        openEditWeeklyModal = function (saturdayDateKey) {
            originalOpenEditWeeklyModal(saturdayDateKey);
            loadSaturdayDailyData(saturdayDateKey);

            // Reset to weekly tab
            switchSaturdayTab('weekly');
        };

        // Load daily data for Saturday
        function loadSaturdayDailyData(dateKey) {
            const data = getData();
            const dayData = data.dailyCommits && data.dailyCommits[dateKey];

            const list = document.getElementById('editSaturdayLifeCommitList');
            list.innerHTML = '';

            if (dayData) {
                document.getElementById('editSaturdayHandOver').value = dayData.handOver || '';

                if (dayData.lifeCommit && dayData.lifeCommit.length > 0) {
                    dayData.lifeCommit.forEach((commit, index) => {
                        const item = document.createElement('div');
                        item.className = 'commit-item';
                        item.innerHTML = `
                            <textarea class="input-field auto-resize">${commit}</textarea>
                            ${index > 0 ? '<button class="btn-remove" onclick="removeEditSaturdayLifeCommit(this)">削除</button>' : ''}
                        `;
                        list.appendChild(item);
                    });
                } else {
                    addDefaultSaturdayDailyCommitItem(list);
                }

                if (dayData.contributionContent) {
                    document.getElementById('editSaturdayContributionContent').value = dayData.contributionContent;
                } else {
                    document.getElementById('editSaturdayContributionContent').value = '';
                }

                editSaturdayCompletionState.life = dayData.lifeCompleted !== undefined ? dayData.lifeCompleted : null;
                editSaturdayCompletionState.contribution = dayData.contributionCompleted !== undefined ? dayData.contributionCompleted : null;
            } else {
                document.getElementById('editSaturdayHandOver').value = '';
                addDefaultSaturdayDailyCommitItem(list);
                document.getElementById('editSaturdayContributionContent').value = '';
                editSaturdayCompletionState = { life: null, contribution: null };
            }

            updateEditSaturdayCompletionButton('life', editSaturdayCompletionState.life);
            updateEditSaturdayCompletionButton('contribution', editSaturdayCompletionState.contribution);
        }

        // Add default commit item for Saturday daily
        function addDefaultSaturdayDailyCommitItem(list) {
            const item = document.createElement('div');
            item.className = 'commit-item';
            item.innerHTML = `<textarea class="input-field auto-resize" placeholder="今日達成すること..."></textarea>`;
            list.appendChild(item);
        }

        // Add life commit for Saturday daily
        function addEditSaturdayLifeCommit() {
            const list = document.getElementById('editSaturdayLifeCommitList');
            const newItem = document.createElement('div');
            newItem.className = 'commit-item';
            newItem.innerHTML = `
                <textarea class="input-field auto-resize" placeholder="今日達成すること..."></textarea>
                <button class="btn-remove" onclick="removeEditSaturdayLifeCommit(this)">削除</button>
            `;
            list.appendChild(newItem);
        }

        // Remove life commit for Saturday daily
        function removeEditSaturdayLifeCommit(button) {
            const list = document.getElementById('editSaturdayLifeCommitList');
            if (list.children.length > 1) {
                button.parentElement.remove();
            } else {
                showToast('最低1つのコミットは必要です', 'error');
            }
        }

        // Set completion state for Saturday daily
        function setEditSaturdayCompletion(type, value) {
            editSaturdayCompletionState[type] = value;
            updateEditSaturdayCompletionButton(type, value);
        }

        // Update completion button for Saturday daily
        function updateEditSaturdayCompletionButton(type, value) {
            const page = document.getElementById('pageDaily');
            const completionItems = page.querySelectorAll('.completion-item');
            const targetItem = type === 'life' ? completionItems[0] : completionItems[1];
            const buttons = targetItem.querySelectorAll('.completion-btn');

            buttons.forEach(btn => {
                btn.classList.remove('selected-yes', 'selected-no');
            });

            if (value === true) {
                buttons[0].classList.add('selected-yes');
            } else if (value === false) {
                buttons[1].classList.add('selected-no');
            }
        }

        // Save Saturday daily commit
        function saveEditedSaturdayDaily() {
            const handOver = document.getElementById('editSaturdayHandOver').value.trim();
            const contributionContent = document.getElementById('editSaturdayContributionContent').value.trim();

            const lifeCommits = [];
            document.querySelectorAll('#editSaturdayLifeCommitList textarea').forEach(textarea => {
                const value = textarea.value.trim();
                if (value) {
                    lifeCommits.push(value);
                }
            });

            if (lifeCommits.length === 0) {
                showToast('最低1つの人生のコミットを入力してください', 'error');
                return;
            }

            const data = getData();

            if (!data.dailyCommits[editingWeeklyDate]) {
                data.dailyCommits[editingWeeklyDate] = {};
            }

            data.dailyCommits[editingWeeklyDate].handOver = handOver;
            data.dailyCommits[editingWeeklyDate].lifeCommit = lifeCommits;
            data.dailyCommits[editingWeeklyDate].contributionContent = contributionContent;
            data.dailyCommits[editingWeeklyDate].timestamp = new Date().toISOString();

            if (editSaturdayCompletionState.life !== null) {
                data.dailyCommits[editingWeeklyDate].lifeCompleted = editSaturdayCompletionState.life;
            }
            if (editSaturdayCompletionState.contribution !== null) {
                data.dailyCommits[editingWeeklyDate].contributionCompleted = editSaturdayCompletionState.contribution;
            }

            if (saveData(data)) {
                showToast('1日コミットを保存しました!', 'success');
                renderCalendar();
            }
        }
