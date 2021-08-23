
import { useState } from 'react';
import './Calculator.scss'

export function Calculator({onShowModal}) {
    const [calc, setCalc] = useState("");
    const [result, setResult] = useState("");

    const ops = ['/', '*', '+', '-','.'];

    const updateCalc = value => {
        if (
            ops.includes(value) && calc === '' ||
            ops.includes(value) && ops.includes(calc.slice(-1))
        ) {
            return;
        }

        setCalc(calc + value);

        if (!ops.includes(value)) {
            setResult(eval(calc + value).toString());
        }
    }

    const createDigits = () => {
        const digits = [];

        for (let i = 1; i < 10; i++) {
            digits.push(
                <button 
                    onClick={() => updateCalc(i.toString())} 
                    key={i}>{i}
                </button>
            )
        }
        return digits;
    }

    const calculate = () => {
        setCalc(eval(calc).toString());
    }

    const deleteNum = () => {
        if (calc == '') {
            return;
        }
        const value = calc.slice(0, -1);
        setCalc(value);
    }

    return (
        <main id="Calculator">
            
                <div className="calculator">
                    <div className="display">
                        <div className="display-box">
                            {result ? <span>({result})</span> : ''} { calc || "0"}
                        </div>
                        <button onClick={deleteNum} class="fas fa-backspace"></button>
                    </div>
                    
                    

                    <div className="operators">
                        <button onClick={() => updateCalc('/')}>/</button>
                        <button onClick={() => updateCalc('*')}>*</button>
                        <button onClick={() => updateCalc('+')}>+</button>
                        <button onClick={() => updateCalc('-')}>-</button>

                        
                    </div>

                    <div className="digits">
                        { createDigits() }
                        <button onClick={() => updateCalc('0')}>0</button>
                        <button onClick={() => updateCalc('.')}>.</button>

                        <button onClick={calculate}>=</button>
                    </div>
                </div>
        </main>
    )
}

export function CalcModal({ onShowModal }) {
    return (
    <main id="CalcModal">
      <div className="modal">
        <div className="modal-content">
          <div className="footer">
            <p>
              <button
                className="red"
                onClick={() => {
                  onShowModal()
                }}
              >
                x
              </button>
            </p>
          </div>
          <div className="header">
            <Calculator/>
          </div>
        </div>
      </div>
    </main>
    )
  }
  