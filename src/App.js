import React, { useEffect, useState, useRef } from 'react'
import { Alert, Col, Container, Form, FormControl, InputGroup, ListGroup, ListGroupItem, Row, Table, Button } from 'react-bootstrap'
import { motion } from 'framer-motion/dist/framer-motion'
import { FaSearch, FaFacebook, FaTelegram, FaTwitter, FaMailBulk } from 'react-icons/fa'
import { AiOutlineSwap, AiFillMail } from 'react-icons/ai'
import SelectField from './SelectField.js'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import countryData from './countries.json'

const BASE_URL = 'https://api.exchangerate.host/latest'

export default function App() {
    const [exchangeRateList, setExchangeRateList] = useState([])    //array for table data
    const [stringList, setStringList] = useState([])     // string array of exchange rate data (country, code, rate)
    const [filteredList, setFilteredList] = useState([])    // filtered search list
    const [showSearchList, setShowSearchList] = useState(false)     // show or hide search results
    const [showClearSearch, setShowClearSearch] = useState(false)     // show or hide clear search button
    const [searchValue, setSearchValue] = useState('')     // 

    const [fromCurrency, setFromCurrency] = useState('')    // from currency code
    const [fromCurrencySymbol, setFromCurrencySymbol] = useState('')  // currency symbol to be passed to 'from select field' 
    const [toCurrency, setToCurrency] = useState('')    // to currency code
    const [toCurrencySymbol, setToCurrencySymbol] = useState('')  // currency symbol to be passed to 'to select field'  

    let [toAmount, setToAmount] = useState()
    let [fromAmount, setFromAmount] = useState()

    let [isFromActive, setIsFromActive] = useState(false)

    const [ratesArray, setRatesArray] = useState([])

    let exchangeRateList_stateless = [] // temp exchange rate list
    let stringList_stateless = []   // temp string array of exchange rate data (country, code, rate)
    let ratesArray_stateless = []     // data.rates array (an array of arrays) with key value pairs

    // initial setup to fecth latest exchange rates
    useEffect(async () => {
        try {
            const response = await fetch('https://api.exchangerate.host/latest')
            const data = await response.json()
            ratesArray_stateless = Object.entries(data.rates)
            setRatesArray(ratesArray_stateless)
            // console.log(data);

            setFromCurrency(data.base)
            setToCurrency(ratesArray_stateless[0][0])

            let match = countryData.find(country => country.currency.code === data.base)
            if (match) {
                setFromCurrencySymbol(match.currency.symbol)
            }
            match = countryData.find(country => country.currency.code === ratesArray_stateless[0][0])
            if (match) {
                setToCurrencySymbol(match.currency.symbol)
            }

            for (let i = 0; i < ratesArray_stateless.length; i++) {
                let code = ratesArray_stateless[i][0]
                let rate = ratesArray_stateless[i][1]
                for (let j = 0; j < countryData.length; j++) {
                    let country = countryData[j]
                    if (country.currency.code === code) {
                        exchangeRateList_stateless.push(
                            <tr key={Math.random()}>
                                <td>{country.name}</td>
                                <td>{code}</td>
                                <td>{rate}</td>
                            </tr>
                        )
                    }
                }
            }
            setExchangeRateList(exchangeRateList_stateless)
            // console.log(exchangeRateList_stateless);

            // populate string list with exchange rate data (country - code | rate)
            for (let i = 0; i < exchangeRateList_stateless.length; i++) {
                let td = exchangeRateList_stateless[i]
                if (td) {
                    let country = td.props.children[0].props.children
                    let code = td.props.children[1].props.children
                    let rate = td.props.children[2].props.children
                    stringList_stateless.push(`${country} - ${code} | ${rate}`)
                }
            }
            setStringList(stringList_stateless)

        }
        catch (err) { console.log(err.message) }
    }, [])

    // update input fields when amounts or currency values change
    useEffect(() => {
        let fromRate = ratesArray.find(pair => pair[0] === fromCurrency)
        let toRate = ratesArray.find(pair => pair[0] === toCurrency)
        if (fromRate && toRate) {
            fromRate = fromRate[1]
            toRate = toRate[1]
        }
        let convertedValue;
        if (isFromActive) {   // if true, changes were made to 'from field' so update 'to field'
            convertedValue = (fromAmount * toRate / fromRate).toFixed(4)
            document.getElementsByClassName('1')[0].value = convertedValue
        }
        else {
            convertedValue = (toAmount * fromRate / toRate).toFixed(4)
            document.getElementsByClassName('0')[0].value = convertedValue
        }

    }, [fromAmount, toAmount, fromCurrency, toCurrency])
    // end

    // filter rates based on search
    function handleSearch(e) {
        let token = e.target.value
        setSearchValue(token)
        if (token.length === 0) {
            setShowSearchList(false)
            setShowClearSearch(false)
        }
        else {
            setShowSearchList(true)
            setShowClearSearch(true)
        }

        let temp = []
        stringList.forEach(string => {
            if (string.toLowerCase().includes(token.toLowerCase())) {
                temp.push(string)
            }
        })
        setFilteredList(temp)
    } // end

    /* HANDLE COUNTRY CODE AND CURRENCY SYMBOL UPDATES WHEN SELECT FIELDS VALUES CHANGE*/
    function onFromSelectChange(e) {
        let value = e.target.value
        setFromCurrency(value)
        let match = countryData.find(country => country.currency.code === value)
        if (match)
            setFromCurrencySymbol(match.currency.symbol)
    }

    function onToSelectChange(e) {
        let value = e.target.value
        setToCurrency(value)
        let match = countryData.find(country => country.currency.code === value)
        if (match)
            setToCurrencySymbol(match.currency.symbol)
    }

    function onFromInputChange(e) {
        setIsFromActive(true)
        setFromAmount(e.target.value)
    }

    function onToInputChange(e) {
        setIsFromActive(false)
        setToAmount(e.target.value)
    }
    /* END */

    return (
        <div className='App'>
            <div className='navbar'>
                <AiOutlineSwap className='exchange_icon' />
                <motion.h1
                    animate={{ scale: [0, 1] }}
                    transition={{ duration: 0.7 }}
                >
                    Currency Converter
                </motion.h1>
            </div>
            <div>
                <Container className='body_container'>
                    <Row>
                        <Col lg={7} sm={12} className='convert_container'>
                            <Alert variant='success' className='convert_alert'>Convert Currency</Alert>
                            <SelectField initial={fromCurrency}
                                ratesArray={ratesArray}
                                onSelectChange={onFromSelectChange}
                                onInputChange={onFromInputChange}
                                currencySymbol={fromCurrencySymbol}
                                inputId='0'
                                inputValue={fromAmount} />
                            <SelectField initial={toCurrency}
                                ratesArray={ratesArray}
                                onSelectChange={onToSelectChange}
                                onInputChange={onToInputChange}
                                currencySymbol={toCurrencySymbol}
                                inputId='1'
                                inputValue={toAmount} />
                        </Col>
                        <Col lg={5} sm={12} className='exchange_rates'>
                            <div className='rates_label'>Current Exchange Rates</div>
                            <div className='search_div'>
                                <Form.Control type='text' value={searchValue} maxLength='25' className='search_box' onChange={handleSearch} />
                                {showClearSearch ? <div className='clear_search' onClick={() => {setSearchValue(''); setShowSearchList(false); setShowClearSearch(false)}}>x</div>
                                                 : ''
                                }
                                <FaSearch className='search_icon' />
                                {showSearchList ?
                                    <ListGroup className='search_list'>
                                        {
                                            filteredList.map((string, index) => {
                                                return (<ListGroupItem key={index} className='search_list_item'>{string}</ListGroupItem>)
                                            })
                                        }
                                    </ListGroup>
                                    : ''
                                }
                            </div>
                            <div className='rates_list'>
                                {/* Populate rates data (country, code, exchange rate) into table*/}
                                <Table striped hover responsive='sm' className='table'>
                                    <thead>
                                        <tr>
                                            <td>Country</td>
                                            <td>Code</td>
                                            <td>Rate</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            exchangeRateList
                                        }
                                    </tbody>
                                </Table>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
            <div className='footer'>
                <Container>
                    <Row>
                        <Col className='footer_text'>Have any suggestions to improve the site ? Please reach out on </Col>
                    </Row>
                    <Row>
                        <Col lg={6} className='icon_container'>
                            <a href='https://m.facebook.com/jerome.akumasi'><FaFacebook className='social_icon' /></a>
                            <a href='https://twitter.com/jrme21445768'><FaTwitter className='social_icon' /></a>
                            <a href='https://t.me/jaakumasi'><FaTelegram className='social_icon' /></a>
                            <a href='mailto:jeromeakumasi01@gmail.com' target='_blank'><FaMailBulk className='social_icon' /></a>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    )
}