import React, { useEffect, useState, useRef } from 'react'
import { Form, FormControl, InputGroup } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import countryData from './countries.json'

export default function SelectField({ initial, ratesArray, onSelectChange, currencySymbol, onInputChange, inputId, inputValue }) {
    const [options, setOptions] = useState([])
    let options_stateless = []
    
    useEffect(() => {
        options_stateless = ratesArray.map((pair, index) => {
            let code = pair[0]
            if(code){
                return <option key={index}>{code}</option>
            }
        })
        setOptions(options_stateless)
        
    }, [ratesArray])
    
    // function onSelectchange(e) {
    //     let value = e.target.value
    //     console.log(value);
    //     setInitVal(value)
    // }
   
    return (
        <InputGroup className='select_field'>
            {/* <img src={`data:image/*;base64,${flag}`} className='flag' /> */}
            <InputGroup.Text className='select_text'>{currencySymbol}</InputGroup.Text>
            <Form.Control type='number' className={`select_input ${inputId}`} onChange={onInputChange} value={inputValue}/>
            <Form.Select onChange={onSelectChange} className='select_select' value={initial} >
                {
                    options
                }
            </Form.Select>
        </InputGroup>
    )
}