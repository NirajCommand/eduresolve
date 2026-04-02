var formData = {
    id: '',
    title: 'Untitled Form',
    desc: '',
    questions: []
};

function showOptionArea()
{
    var type = document.getElementById('questionType');
    var optionArea = document.getElementById('optionArea');

    if(type == null || optionArea == null)
    {
        return;
    }

    if(type.value == 'short' || type.value == 'long')
    {
        optionArea.style.display = 'none';
    }
    else
    {
        optionArea.style.display = 'block';
    }
}

function saveFormDetails()
{
    var titleBox = document.getElementById('formTitle');
    var descBox = document.getElementById('formDesc');
    var title;
    var desc;

    if(titleBox == null || descBox == null)
    {
        return;
    }

    title = titleBox.value.trim();
    desc = descBox.value.trim();

    if(title != '')
    {
        formData.title = title;
    }
    else
    {
        formData.title = 'Untitled Form';
    }

    formData.desc = desc;

    saveDraft();
    showBuilder();
    alert('Form details saved');
}

function addQuestion()
{
    var textBox = document.getElementById('questionText');
    var typeBox = document.getElementById('questionType');
    var reqBox = document.getElementById('questionRequired');
    var optBox = document.getElementById('questionOptions');
    var text;
    var type;
    var required;
    var rawOptions;
    var options = [];
    var lines;
    var i;

    if(textBox == null || typeBox == null || reqBox == null || optBox == null)
    {
        return;
    }

    text = textBox.value.trim();
    type = typeBox.value;
    required = reqBox.checked;
    rawOptions = optBox.value.trim();

    if(text == '')
    {
        alert('Enter question text');
        return;
    }

    if(type != 'short' && type != 'long')
    {
        lines = rawOptions.split('\n');

        for(i = 0; i < lines.length; i++)
        {
            if(lines[i].trim() != '')
            {
                options.push(lines[i].trim());
            }
        }

        if(options.length < 2)
        {
            alert('Enter at least 2 options');
            return;
        }
    }

    formData.questions.push({
        id: new Date().getTime().toString(),
        text: text,
        type: type,
        required: required,
        options: options
    });

    textBox.value = '';
    optBox.value = '';
    reqBox.checked = false;

    saveDraft();
    showBuilder();
}

function moveUp(index)
{
    var temp;

    if(index == 0)
    {
        return;
    }

    temp = formData.questions[index - 1];
    formData.questions[index - 1] = formData.questions[index];
    formData.questions[index] = temp;

    saveDraft();
    showBuilder();
}

function moveDown(index)
{
    var temp;

    if(index == formData.questions.length - 1)
    {
        return;
    }

    temp = formData.questions[index + 1];
    formData.questions[index + 1] = formData.questions[index];
    formData.questions[index] = temp;

    saveDraft();
    showBuilder();
}

function deleteQuestion(index)
{
    formData.questions.splice(index, 1);
    saveDraft();
    showBuilder();
}

function publishForm()
{
    var allForms;
    var linkBox;
    var idText;
    var link;

    if(formData.questions.length == 0)
    {
        alert('Add at least one question before publishing');
        return;
    }

    if(formData.id == '')
    {
        formData.id = makeFormId();
    }

    allForms = JSON.parse(localStorage.getItem('flowforgeForms') || '{}');
    allForms[formData.id] = JSON.parse(JSON.stringify(formData));
    localStorage.setItem('flowforgeForms', JSON.stringify(allForms));

    idText = document.getElementById('formIdText');
    linkBox = document.getElementById('formLink');

    if(idText != null)
    {
        idText.innerHTML = formData.id;
    }

    if(linkBox != null)
    {
        link = 'respond.html?formId=' + formData.id;
        linkBox.value = link;
    }

    alert('Form published successfully');
}

function makeFormId()
{
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var id = '';
    var i;
    var n;

    for(i = 0; i < 6; i++)
    {
        n = Math.floor(Math.random() * chars.length);
        id = id + chars.charAt(n);
    }

    return id;
}

function getTypeName(type)
{
    if(type == 'single')
    {
        return 'Single Choice';
    }

    if(type == 'multi')
    {
        return 'Multiple Choice';
    }

    if(type == 'short')
    {
        return 'Short Answer';
    }

    if(type == 'long')
    {
        return 'Written Answer';
    }

    if(type == 'dropdown')
    {
        return 'Dropdown';
    }

    return type;
}

function getOptionText(q)
{
    if(!q.options || q.options.length == 0)
    {
        return 'Text answer';
    }

    return 'Options: ' + q.options.join(', ');
}

function getPreviewField(q, index, disabled)
{
    var html = '';
    var i;

    html += '<div style="margin-top:10px;">';

    if(q.type == 'single')
    {
        for(i = 0; i < q.options.length; i++)
        {
            html += '<div><label style="font-weight:normal;"><input type="radio" name="p' + index + '"';

            if(disabled)
            {
                html += ' disabled';
            }

            html += '> ' + q.options[i] + '</label></div>';
        }
    }
    else if(q.type == 'multi')
    {
        for(i = 0; i < q.options.length; i++)
        {
            html += '<div><label style="font-weight:normal;"><input type="checkbox"';

            if(disabled)
            {
                html += ' disabled';
            }

            html += '> ' + q.options[i] + '</label></div>';
        }
    }
    else if(q.type == 'dropdown')
    {
        html += '<select';

        if(disabled)
        {
            html += ' disabled';
        }

        html += '><option>Select an option</option>';

        for(i = 0; i < q.options.length; i++)
        {
            html += '<option>' + q.options[i] + '</option>';
        }

        html += '</select>';
    }
    else if(q.type == 'short')
    {
        html += '<input type="text" class="input-box" placeholder="Short answer"';

        if(disabled)
        {
            html += ' disabled';
        }

        html += '>';
    }
    else
    {
        html += '<textarea placeholder="Write your answer"';

        if(disabled)
        {
            html += ' disabled';
        }

        html += '></textarea>';
    }

    html += '</div>';

    return html;
}

function showBuilder()
{
    var list = document.getElementById('questionList');
    var preview = document.getElementById('previewArea');
    var previewTitle = document.getElementById('previewTitle');
    var previewDesc = document.getElementById('previewDesc');
    var formIdText = document.getElementById('formIdText');
    var formLink = document.getElementById('formLink');
    var i;
    var q;
    var box;
    var pbox;

    if(list == null || preview == null || previewTitle == null || previewDesc == null)
    {
        return;
    }

    previewTitle.innerHTML = formData.title;

    if(formData.desc != '')
    {
        previewDesc.innerHTML = formData.desc;
    }
    else
    {
        previewDesc.innerHTML = 'No description added yet.';
    }

    list.innerHTML = '';
    preview.innerHTML = '';

    if(formData.id != '')
    {
        if(formIdText != null)
        {
            formIdText.innerHTML = formData.id;
        }

        if(formLink != null)
        {
            formLink.value = 'respond.html?formId=' + formData.id;
        }
    }

    if(formData.questions.length == 0)
    {
        list.innerHTML = '<div class="empty-box">No questions added yet</div>';
        preview.innerHTML = '<div class="light-text">Questions will appear here</div>';
        return;
    }

    for(i = 0; i < formData.questions.length; i++)
    {
        q = formData.questions[i];

        box = document.createElement('div');
        box.className = 'question-box';
        box.innerHTML =
            '<div class="question-top">' +
            '<div>' +
            '<strong>Q' + (i + 1) + '. ' + q.text + '</strong><br>' +
            '<span class="tag">' + getTypeName(q.type) + '</span>' +
            (q.required ? '<span class="tag" style="background:#fee2e2;color:#991b1b;">Required</span>' : '') +
            '</div>' +
            '<div class="question-btns">' +
            '<button class="sub-btn" onclick="moveUp(' + i + ')">Move Up</button>' +
            '<button class="sub-btn" onclick="moveDown(' + i + ')">Move Down</button>' +
            '<button class="del-btn" onclick="deleteQuestion(' + i + ')">Delete</button>' +
            '</div>' +
            '</div>' +
            '<div class="light-text">' + getOptionText(q) + '</div>';

        list.appendChild(box);

        pbox = document.createElement('div');
        pbox.className = 'answer-box';
        pbox.innerHTML =
            '<strong>' + q.text + ' ' +
            (q.required ? '<span class="red-star">*</span>' : '') +
            '</strong>' +
            getPreviewField(q, i, true);

        preview.appendChild(pbox);
    }
}

function getAnswerField(q, index)
{
    var html = '';
    var i;

    html += '<div style="margin-top:10px;">';

    if(q.type == 'single')
    {
        for(i = 0; i < q.options.length; i++)
        {
            html += '<div><label style="font-weight:normal;"><input type="radio" name="ans_' + index + '" value="' + q.options[i] + '"> ' + q.options[i] + '</label></div>';
        }
    }
    else if(q.type == 'multi')
    {
        for(i = 0; i < q.options.length; i++)
        {
            html += '<div><label style="font-weight:normal;"><input type="checkbox" name="ans_' + index + '" value="' + q.options[i] + '"> ' + q.options[i] + '</label></div>';
        }
    }
    else if(q.type == 'dropdown')
    {
        html += '<select id="ans_' + index + '"><option value="">Select</option>';

        for(i = 0; i < q.options.length; i++)
        {
            html += '<option value="' + q.options[i] + '">' + q.options[i] + '</option>';
        }

        html += '</select>';
    }
    else if(q.type == 'short')
    {
        html += '<input type="text" id="ans_' + index + '" class="input-box" placeholder="Short answer">';
    }
    else
    {
        html += '<textarea id="ans_' + index + '" placeholder="Write your answer"></textarea>';
    }

    html += '</div>';

    return html;
}

function openForm()
{
    var joinBox = document.getElementById('joinId');
    var area = document.getElementById('answerArea');
    var id;
    var allForms;
    var form;
    var html = '';
    var card;
    var i;
    var q;

    if(joinBox == null || area == null)
    {
        return;
    }

    id = joinBox.value.trim().toUpperCase();
    allForms = JSON.parse(localStorage.getItem('flowforgeForms') || '{}');
    form = allForms[id];

    area.innerHTML = '';

    if(!form)
    {
        area.innerHTML = '<div class="card empty-box">Form not found. Check the Form ID.</div>';
        return;
    }

    html += '<h2>' + form.title + '</h2>';
    html += '<p>' + form.desc + '</p>';

    for(i = 0; i < form.questions.length; i++)
    {
        q = form.questions[i];
        html += '<div class="answer-box">';
        html += '<strong>' + (i + 1) + '. ' + q.text + ' ' + (q.required ? '<span class="red-star">*</span>' : '') + '</strong>';
        html += getAnswerField(q, i);
        html += '</div>';
    }

    html += '<button class="main-btn" onclick="submitForm(\'' + id + '\')">Submit Response</button>';

    card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = html;
    area.appendChild(card);
}

function submitForm(id)
{
    var allForms = JSON.parse(localStorage.getItem('flowforgeForms') || '{}');
    var allResponses = JSON.parse(localStorage.getItem('flowforgeResponses') || '{}');
    var form = allForms[id];
    var oneResponse = [];
    var i;
    var q;
    var value;
    var checked;
    var j;

    if(!form)
    {
        return;
    }

    for(i = 0; i < form.questions.length; i++)
    {
        q = form.questions[i];
        value = '';

        if(q.type == 'single')
        {
            checked = document.querySelector('input[name="ans_' + i + '"]:checked');

            if(checked)
            {
                value = checked.value;
            }
        }
        else if(q.type == 'multi')
        {
            value = [];
            checked = document.querySelectorAll('input[name="ans_' + i + '"]:checked');

            for(j = 0; j < checked.length; j++)
            {
                value.push(checked[j].value);
            }
        }
        else
        {
            value = document.getElementById('ans_' + i).value.trim();
        }

        if(q.required)
        {
            if(Array.isArray(value) && value.length == 0)
            {
                alert('Please fill all required questions');
                return;
            }

            if(!Array.isArray(value) && value == '')
            {
                alert('Please fill all required questions');
                return;
            }
        }

        oneResponse.push({
            questionId: q.id,
            answer: value
        });
    }

    if(!allResponses[id])
    {
        allResponses[id] = [];
    }

    allResponses[id].push({
        time: new Date().toLocaleString(),
        answers: oneResponse
    });

    localStorage.setItem('flowforgeResponses', JSON.stringify(allResponses));
    alert('Response submitted successfully');
    openForm();
}

function showAnalytics()
{
    var idBox = document.getElementById('analyticsId');
    var area = document.getElementById('analyticsArea');
    var id;
    var allForms;
    var allResponses;
    var form;
    var responses;
    var html = '';
    var i;
    var j;
    var k;
    var q;
    var counts;
    var ans;
    var count;
    var percent;

    if(idBox == null || area == null)
    {
        return;
    }

    id = idBox.value.trim().toUpperCase();
    allForms = JSON.parse(localStorage.getItem('flowforgeForms') || '{}');
    allResponses = JSON.parse(localStorage.getItem('flowforgeResponses') || '{}');
    form = allForms[id];
    responses = allResponses[id] || [];

    area.innerHTML = '';

    if(!form)
    {
        area.innerHTML = '<div class="card empty-box">Form not found for analytics</div>';
        return;
    }

    html += '<div class="card"><h3>' + form.title + '</h3><p>Total Responses: <strong>' + responses.length + '</strong></p></div>';

    if(responses.length == 0)
    {
        html += '<div class="card empty-box">No responses submitted yet</div>';
        area.innerHTML = html;
        return;
    }

    html += '<div class="analytics-grid">';

    for(i = 0; i < form.questions.length; i++)
    {
        q = form.questions[i];
        html += '<div class="card"><h3>' + (i + 1) + '. ' + q.text + '</h3><p class="light-text">' + getTypeName(q.type) + '</p>';

        if(q.type == 'single' || q.type == 'dropdown')
        {
            counts = {};

            for(j = 0; j < q.options.length; j++)
            {
                counts[q.options[j]] = 0;
            }

            for(j = 0; j < responses.length; j++)
            {
                ans = responses[j].answers[i].answer;

                if(counts[ans] != undefined)
                {
                    counts[ans] = counts[ans] + 1;
                }
            }

            for(j = 0; j < q.options.length; j++)
            {
                count = counts[q.options[j]];
                percent = 0;

                if(responses.length != 0)
                {
                    percent = (count / responses.length) * 100;
                }

                html += '<div class="bar-wrap">';
                html += '<div class="bar-top"><span>' + q.options[j] + '</span><span>' + count + '</span></div>';
                html += '<div class="bar-bg"><div class="bar-fill" style="width:' + percent + '%;"></div></div>';
                html += '</div>';
            }
        }
        else if(q.type == 'multi')
        {
            counts = {};

            for(j = 0; j < q.options.length; j++)
            {
                counts[q.options[j]] = 0;
            }

            for(j = 0; j < responses.length; j++)
            {
                ans = responses[j].answers[i].answer;

                for(k = 0; k < ans.length; k++)
                {
                    if(counts[ans[k]] != undefined)
                    {
                        counts[ans[k]] = counts[ans[k]] + 1;
                    }
                }
            }

            for(j = 0; j < q.options.length; j++)
            {
                count = counts[q.options[j]];
                percent = 0;

                if(responses.length != 0)
                {
                    percent = (count / responses.length) * 100;
                }

                html += '<div class="bar-wrap">';
                html += '<div class="bar-top"><span>' + q.options[j] + '</span><span>' + count + '</span></div>';
                html += '<div class="bar-bg"><div class="bar-fill" style="width:' + percent + '%;"></div></div>';
                html += '</div>';
            }
        }
        else
        {
            html += '<div class="light-text">Recent text responses:</div>';

            for(j = responses.length - 1; j >= 0 && j >= responses.length - 5; j--)
            {
                ans = responses[j].answers[i].answer;
                html += '<p style="background:#f3f4f6; padding:8px; border-radius:8px;">' + (ans || '(No answer)') + '</p>';
            }
        }

        html += '</div>';
    }

    html += '</div>';
    area.innerHTML = html;
}

function saveDraft()
{
    localStorage.setItem('flowforgeDraft', JSON.stringify(formData));
}

function loadDraft()
{
    var draft = JSON.parse(localStorage.getItem('flowforgeDraft') || 'null');
    var titleBox = document.getElementById('formTitle');
    var descBox = document.getElementById('formDesc');

    if(draft)
    {
        formData = draft;
    }

    if(titleBox != null)
    {
        if(formData.title != 'Untitled Form')
        {
            titleBox.value = formData.title;
        }
    }

    if(descBox != null)
    {
        descBox.value = formData.desc || '';
    }

    showBuilder();
}

function loadLinkForm()
{
    var params = new URLSearchParams(window.location.search);
    var id = params.get('formId');
    var joinBox = document.getElementById('joinId');

    if(id == null || joinBox == null)
    {
        return;
    }

    joinBox.value = id.toUpperCase();
    openForm();
}

showOptionArea();
loadDraft();
loadLinkForm();