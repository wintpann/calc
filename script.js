const button = {
  keys: {
    'delete': 'ac',
    'shift': 'changeMark',
    'backspace': 'delete',
    '/': 'divide',
    '7': 'seven',
    '8': 'eight',
    '9': 'nine',
    '*': 'multiply',
    '4': 'four',
    '5': 'five',
    '6': 'six',
    '-': 'minus',
    '1': 'one',
    '2': 'two',
    '3': 'three',
    '+': 'plus',
    '0': 'zero',
    '.': 'period',
    ',': 'period',
    '=': 'equals',
    'enter': 'equals'
  },

  getButton: function (key) {
    return this.keys[key.toLowerCase()]
  },

  getButtonElementBy: function (value, by) {
    switch (by) {
      case 'target':
        return value
      case 'key':
        return document.getElementById(this.getButton(value))
      default:
        break
    }
  },

  evalKeyPress(key) {
    const btn = this.getButton(key)
    if (btn) { eval(btn + 'Click()') }
  },

  evalMouseClick(target) {
    if (target.classList.contains('btn')) { eval(target.id + 'Click()') }
  },

  markButtonPress(value, type) {
    const btn = this.getButtonElementBy(value, type)
    if (btn && btn.classList.contains('btn')) { btn.classList.add('btn-press') }
  },

  unmarkButtonPress(value, type) {
    const btn = this.getButtonElementBy(value, type)
    if (btn && btn.classList.contains('btn')) { btn.classList.remove('btn-press') }
  }
}

const markup = {
  generate: function (expression) {
    let html = ''
    const chain = expression.split(/(-|\+|\*|\/|=)/g).filter(function (value, index, array) {return value})
    for (let i = 0; i < chain.length; i++) {
      const el = chain[i]
      if (el.match(/(-|\+|\*|\/)/g)) {
        html += '<span class="mark">' + el + '</span>'
      } else if (el == '=') {
        html += '<span class="equals">' + el + '</span>'
      } else {
        html += '<span>' + el + '</span>'
      }
    }
    return html
  }
}

const history = {
  listElement: document.querySelector('#history>ul'),
  lineElement: document.querySelector('#history>ul').lastElementChild,

  line: '',

  update: function () {
    this.lineElement.innerHTML = markup.generate(this.line)
  },

  addChar: function (char) {
    this.line += char
    this.update()
  },

  removeLastChar: function () {
    this.line = this.line.substring(0, this.line.length - 1)
    this.update()
  },

  changeMark: function (mark) {
    this.removeLastChar()
    this.addChar(mark)
  },

  clearLine: function () {
    this.line = ''
    this.update()
  },

  unshiftMinus: function () {
    const place = this.line.lastIndexOf(this.lineElement.lastElementChild.textContent)
    this.line = this.line.substring(0, place) + '-' + this.line.substring(place)
    this.update()
  },

  shiftMinus: function () {
    const place = this.line.lastIndexOf(this.lineElement.lastElementChild.textContent)
    this.line = this.line.substring(0, place - 1) + this.line.substring(place)
    this.update()
  },

  finish: function () {
    this.line += '=' + calculator.middleRes
    this.update()
    this.line = ''
    this.listElement.append(document.createElement('li'))
    this.lineElement = this.listElement.lastElementChild
  }
}

const topDisplay = {
  element: document.getElementById('top-display'),
  value: '',

  update: function (middleRes, current, mark) {
    const value = middleRes ? middleRes : current

    if (parseFloat(value) === 0) {
      this.value = 0 + mark
    } else if (value[value.length - 1] === '.') {
      this.value = value.substring(0, value.length - 1) + mark
    } else {
      this.value = value + mark
    }
    
    this.element.innerHTML = markup.generate(this.value)
  },

  changeOperation: function(mark) {
    this.update(undefined, this.value.substring(0, this.value.length - 1), mark)
  },

  getMark: function() {
    return this.value[this.value.length - 1]
  },

  clear: function () {
    this.value = ''
    this.element.innerHTML = ''
  }
}

const bottomDisplay = {
  element: document.getElementById('bottom-display'),
  value: '',

  update: function () {
    this.element.innerHTML = markup.generate(this.value)
  },

  add: function (value) {
    var diff = ''
    if (calculator.justCalculated) {
      this.value = ''
      calculator.justCalculated = false
    }
    switch (value) {
      case '.':
        if (!this.value.includes('.')) {
          if (this.value) {
            diff = value
            this.value += diff
          }else{
            diff = '0' + value
            this.value += diff
          }
        }
        break
      case '0':
        if (this.value.includes('.')) {
          diff = value
          this.value += diff
        } else if (!this.value) {
          diff = value
          this.value += diff
        } else if (this.value && this.value[0] !== '0') {
          diff = value
          this.value += diff
        }
        break
      default:
        if (this.value === '0') {
          diff = value
          this.value = diff
          history.removeLastChar()
        } else {
          diff = value
          this.value += diff
        }
        break
    }
    this.update()
    history.addChar(diff)
  },

  delete: function () {
    if (this.value) { history.removeLastChar() }
    this.value = this.value.substr(0, this.value.length - 1)
    this.update()
  },

  clear: function () {
    this.value = ''
    this.update()
  },

  changeMark: function () {
    if (this.value.includes('-')) {
      this.value = this.value.substring(1)
      history.shiftMinus()
    } else {
      this.value = '-' + this.value
      history.unshiftMinus()
    }
    this.update()
  },

  minus: function () {
    if (this.value) {
      calculator.justCalculated ? history.addChar(this.value + '-') : history.addChar('-')
      calculator.update(this.value)
      topDisplay.update(calculator.middleRes, this.value, '-')
      this.clear()
    } else if (!this.value && topDisplay.value) {
      topDisplay.changeOperation('-')
      history.changeMark('-')
    }
  },

  plus: function () {
    if (this.value) {
      calculator.justCalculated ? history.addChar(this.value + '+') : history.addChar('+')
      calculator.update(this.value)
      topDisplay.update(calculator.middleRes, this.value, '+')
      this.clear()
    } else if (!this.value && topDisplay.value) {
      topDisplay.changeOperation('+')
      history.changeMark('+')
    }
  },

  divide: function () {
    if (this.value) {
      calculator.justCalculated ? history.addChar(this.value + '/') : history.addChar('/')
      calculator.update(this.value)
      topDisplay.update(calculator.middleRes, this.value, '/')
      this.clear()
    } else if (!this.value && topDisplay.value) {
      topDisplay.changeOperation('/')
      history.changeMark('/')
    }
  },

  multiply: function () {
    if (this.value) {
      calculator.justCalculated ? history.addChar(this.value + '*') : history.addChar('*')
      calculator.update(this.value)
      topDisplay.update(calculator.middleRes, this.value, '*')
      this.clear()
    } else if (!this.value && topDisplay.value) {
      topDisplay.changeOperation('*')
      history.changeMark('*')
    }
  },

  equals: function () {
    if (topDisplay.value && this.value) {
      calculator.update(this.value)
      topDisplay.clear()
      this.value = calculator.middleRes.toString()
      this.update()
      history.finish()
      calculator.finish()
    }
  }
}

const calculator = {
  justCalculated: false,
  isCalculating: false,
  middleRes: undefined,

  update: function(value) {
    if (!this.isCalculating) {
      this.middleRes = new Decimal(value)
    } else {
      this.middleRes = eval('this.middleRes.' + this.operations[topDisplay.getMark()] + '(new Decimal(' + value + '))')
      
    }
    this.isCalculating = true
    this.justCalculated = false
  },

  finish: function () {
    this.middleRes = undefined
    this.isCalculating = false
    this.justCalculated = true
  },

  operations: {
    '+': 'plus',
    '-': 'minus',
    '/': 'dividedBy',
    '*': 'times'
  }
}

function acClick() {
  bottomDisplay.clear()
  topDisplay.clear()
  calculator.finish()
  history.clearLine()
}

function changeMarkClick() {
  bottomDisplay.changeMark()
}

function deleteClick() {
  bottomDisplay.delete()
}

function divideClick() {
  bottomDisplay.divide()
}

function sevenClick() {
  bottomDisplay.add('7')
}

function eightClick() {
  bottomDisplay.add('8')
}

function nineClick() {
  bottomDisplay.add('9')
}

function multiplyClick() {
  bottomDisplay.multiply()
}

function fourClick() {
  bottomDisplay.add('4')
}

function fiveClick() {
  bottomDisplay.add('5')
}

function sixClick() {
  bottomDisplay.add('6')
}

function minusClick() {
  bottomDisplay.minus()
}

function oneClick() {
  bottomDisplay.add('1')
}

function twoClick() {
  bottomDisplay.add('2')
}

function threeClick() {
  bottomDisplay.add('3')
}

function plusClick() {
  bottomDisplay.plus()
}

function zeroClick() {
  bottomDisplay.add('0')
}

function periodClick() {
  bottomDisplay.add('.')
}

function equalsClick() {
  bottomDisplay.equals()
}

document.addEventListener('mousedown', function (event) {
  button.markButtonPress(event.target, 'target')
  button.evalMouseClick(event.target)
})

document.addEventListener('mouseup', function (event) {
  button.unmarkButtonPress(event.target, 'target')
})

document.addEventListener('mouseout', function (event) {
  button.unmarkButtonPress(event.target, 'target')
})

document.addEventListener('keydown', function (event) {
  event.preventDefault()
  button.markButtonPress(event.key, 'key')
  button.evalKeyPress(event.key)
})

document.addEventListener('keyup', function (event) {
  button.unmarkButtonPress(event.key, 'key')
})
