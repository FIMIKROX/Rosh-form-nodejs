const form = document.getElementById('myForm')
const successMsg = document.getElementById('successMsg')
const submitBtn = document.querySelector('button')

form.addEventListener('submit', async function(e) {
    e.preventDefault()
    
    // Error hide kar pehle
    document.querySelectorAll('.error').forEach(err => err.style.display = 'none')
    successMsg.style.display = 'none'
    
    let isValid = true
    
    // 1. Naam check
    const name = document.getElementById('name').value.trim()
    if (name === '' || name.length < 3) {
        document.getElementById('nameError').style.display = 'block'
        isValid = false
    }
    
    // 2. Email check
    const email = document.getElementById('email').value.trim()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
        document.getElementById('emailError').style.display = 'block'
        isValid = false
    }
    
    // 3. Phone check
    const phone = document.getElementById('phone').value.trim()
    if (phone.length !== 10 || isNaN(phone)) {
        document.getElementById('phoneError').style.display = 'block'
        isValid = false
    }
    
    // 4. Course check
    const course = document.getElementById('course').value
    if (course === '') {
        document.getElementById('courseError').style.display = 'block'
        isValid = false
    }
    
    if (isValid) {
        const formData = {
            name: name,
            email: email,
            phone: phone,
            course: course,
            message: document.getElementById('message').value.trim()
        }
        
        submitBtn.disabled = true
        submitBtn.innerText = 'Submitting...'
        
        try {
            const res = await fetch('/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            
            const data = await res.json()
            
            if(data.success) {
                successMsg.className = 'success-msg'
                successMsg.innerHTML = '✅ ' + data.message
                form.reset()
            } else {
                successMsg.className = 'success-msg error'
                successMsg.innerHTML = '❌ ' + data.message
            }
            
            successMsg.style.display = 'block'
            setTimeout(() => { successMsg.style.display = 'none' }, 4000)
            
        } catch (err) {
            successMsg.className = 'success-msg error'
            successMsg.innerHTML = '❌ Server error: Backend se connect nahi hua'
            successMsg.style.display = 'block'
        }
        
        submitBtn.disabled = false
        submitBtn.innerText = 'Form Submit Kar →'
    }
})
