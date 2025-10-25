import React from 'react'import React, { useState, useEffect } from 'react'import React, { useState, useEffect } from 'react'

import ServicePanel from '../../components/ServicePanel'

import axios from 'axios'import axios from 'axios'

const CompliancePanel = () => (

  <ServicePanelimport ServicePanel from '../../components/ServicePanel'import ServicePanel from '../../components/ServicePanel'

    title="Compliance & Global Genesis"

    description="Regulatory compliance and planetary economic instantiation"

    stats={[

      { label: 'Total Allocation', value: '195M AZR', change: 'Funded' },const CompliancePanel = () => {const CompliancePanel = () => {

      { label: 'Available Funds', value: '170M AZR', change: 'Ready' },

      { label: 'Instantiated Economies', value: '25', change: '+2' },  const [genesisStatus, setGenesisStatus] = useState(null)  const [genesisStatus, setGenesisStatus] = useState(null)

      { label: 'Seed Grant Amount', value: '1M AZR', change: 'Per nation' }

    ]}  const [countries, setCountries] = useState([])  const [countries, setCountries] = useState([])

    actions={[

      { label: 'Refresh Status', onClick: () => console.log('Refresh') },  const [selectedCountry, setSelectedCountry] = useState('')  const [selectedCountry, setSelectedCountry] = useState('')

      { label: 'View Fund Details', onClick: () => console.log('View fund details') }

    ]}  const [countryData, setCountryData] = useState(null)  const [countryData, setCountryData] = useState(null)

  >

    <div className="p-4">  const [loading, setLoading] = useState(true)  const [loading, setLoading] = useState(true)

      <p className="text-muted-foreground">Compliance panel content will be implemented here.</p>

    </div>  const [checkingTrigger, setCheckingTrigger] = useState(false)  const [checkingTrigger, setCheckingTrigger] = useState(false)

  </ServicePanel>

)  const [instantiating, setInstantiating] = useState(false)  const [instantiating, setInstantiating] = useState(false)



export default CompliancePanel  const [error, setError] = useState(null)  const [error, setError] = useState(null)

  const [triggerData, setTriggerData] = useState({  const [triggerData, setTriggerData] = useState({

    userCount: '',    userCount: '',

    university: '',    university: '',

    teamSize: ''    teamSize: ''

  })  })



  useEffect(() => {  useEffect(() => {

    fetchGenesisStatus()    fetchGenesisStatus()

  }, [])  }, [])



  const fetchGenesisStatus = async () => {  const fetchGenesisStatus = async () => {

    try {    try {

      setLoading(true)      setLoading(true)

      setError(null)      setError(null)



      const response = await axios.get('http://localhost:4099/api/citadel/genesis/status')      const response = await axios.get('http://localhost:4099/api/citadel/genesis/status')

      setGenesisStatus(response.data)      setGenesisStatus(response.data)



      const countriesResponse = await axios.get('http://localhost:4099/api/citadel/economies')      const countriesResponse = await axios.get('http://localhost:4099/api/citadel/economies')

      setCountries(countriesResponse.data.economies || [])      setCountries(countriesResponse.data.economies || [])

    } catch (err) {    } catch (err) {

      console.error('Error fetching genesis status:', err)      console.error('Error fetching genesis status:', err)

      setError('Failed to load compliance data. Using mock data.')      setError('Failed to load compliance data. Using mock data.')



      setGenesisStatus({      setGenesisStatus({

        globalGenesisFund: {        globalGenesisFund: {

          totalAllocation: 195000000,          totalAllocation: 195000000,

          allocated: 25000000,          allocated: 25000000,

          available: 170000000,          available: 170000000,

          nationsCovered: 195,          nationsCovered: 195,

          instantiatedEconomies: 25          instantiatedEconomies: 25

        },        },

        seedGrantConfig: {        seedGrantConfig: {

          amountPerNation: 1000000,          amountPerNation: 1000000,

          totalNations: 195,          totalNations: 195,

          escrowStatus: 'active'          escrowStatus: 'active'

        }        }

      })      })



      setCountries([      setCountries([

        { country: 'South Africa', region: 'Africa', localToken: 'aZAR', instantiationDate: '2024-01-15' },        { country: 'South Africa', region: 'Africa', localToken: 'aZAR', instantiationDate: '2024-01-15' },

        { country: 'United States', region: 'Americas', localToken: 'aUSD', instantiationDate: '2024-01-20' },        { country: 'United States', region: 'Americas', localToken: 'aUSD', instantiationDate: '2024-01-20' },

        { country: 'United Kingdom', region: 'Europe', localToken: 'aGBP', instantiationDate: '2024-01-25' },        { country: 'United Kingdom', region: 'Europe', localToken: 'aGBP', instantiationDate: '2024-01-25' },

      ])      ])

    } finally {    } finally {

      setLoading(false)      setLoading(false)

    }    }

  }  }



  const fetchCountryData = async (country) => {  const fetchCountryData = async (country) => {

    if (!country) return    if (!country) return



    try {    try {

      const response = await axios.get(`http://localhost:4099/api/citadel/grants/${encodeURIComponent(country)}`)      const response = await axios.get(`http://localhost:4099/api/citadel/grants/${encodeURIComponent(country)}`)

      setCountryData(response.data)      setCountryData(response.data)

    } catch (err) {    } catch (err) {

      console.error('Error fetching country data:', err)      console.error('Error fetching country data:', err)

      setError('Failed to load country data.')      setError('Failed to load country data.')



      setCountryData({      setCountryData({

        country,        country,

        region: 'Africa',        region: 'Africa',

        sovereignSeedGrant: {        sovereignSeedGrant: {

          amount: 1000000,          amount: 1000000,

          status: 'escrowed',          status: 'escrowed',

          escrowId: 'escrow-123'          escrowId: 'escrow-123'

        },        },

        activationStatus: {        activationStatus: {

          userThreshold: { current: 5000, required: 10000, achieved: false },          userThreshold: { current: 5000, required: 10000, achieved: false },

          universityTreaty: { status: 'pending' },          universityTreaty: { status: 'pending' },

          foundingTeam: { status: 'pending' }          foundingTeam: { status: 'pending' }

        },        },

        economyStatus: {        economyStatus: {

          instantiated: false,          instantiated: false,

          localToken: null          localToken: null

        }        }

      })      })

    }    }

  }  }



  const checkActivationTrigger = async (triggerType) => {  const checkActivationTrigger = async (triggerType) => {

    if (!selectedCountry) return    if (!selectedCountry) return



    try {    try {

      setCheckingTrigger(true)      setCheckingTrigger(true)

      setError(null)      setError(null)



      let triggerPayload = { country: selectedCountry, triggerType }      let triggerPayload = { country: selectedCountry, triggerType }



      switch (triggerType) {      switch (triggerType) {

        case 'userThreshold':        case 'userThreshold':

          triggerPayload.triggerData = { userCount: parseInt(triggerData.userCount) || 0 }          triggerPayload.triggerData = { userCount: parseInt(triggerData.userCount) || 0 }

          break          break

        case 'universityTreaty':        case 'universityTreaty':

          triggerPayload.triggerData = {          triggerPayload.triggerData = {

            status: 'signed',            status: 'signed',

            university: triggerData.university            university: triggerData.university

          }          }

          break          break

        case 'foundingTeam':        case 'foundingTeam':

          triggerPayload.triggerData = {          triggerPayload.triggerData = {

            petitionId: `petition-${Date.now()}`,            petitionId: `petition-${Date.now()}`,

            teamSize: parseInt(triggerData.teamSize) || 0            teamSize: parseInt(triggerData.teamSize) || 0

          }          }

          break          break

      }      }



      const response = await axios.post('http://localhost:4099/api/citadel/triggers/check', triggerPayload)      const response = await axios.post('http://localhost:4099/api/citadel/triggers/check', triggerPayload)



      if (response.data.success) {      if (response.data.success) {

        await fetchCountryData(selectedCountry)        await fetchCountryData(selectedCountry)

        await fetchGenesisStatus()        await fetchGenesisStatus()

      }      }

    } catch (err) {    } catch (err) {

      console.error('Error checking trigger:', err)      console.error('Error checking trigger:', err)

      setError('Failed to check activation trigger.')      setError('Failed to check activation trigger.')

    } finally {    } finally {

      setCheckingTrigger(false)      setCheckingTrigger(false)

    }    }

  }  }



  const executeInstantiation = async () => {  const executeInstantiation = async () => {

    if (!selectedCountry) return    if (!selectedCountry) return



    try {    try {

      setInstantiating(true)      setInstantiating(true)

      setError(null)      setError(null)



      const response = await axios.post(`http://localhost:4099/api/citadel/instantiate/${encodeURIComponent(selectedCountry)}`, {      const response = await axios.post(`http://localhost:4099/api/citadel/instantiate/${encodeURIComponent(selectedCountry)}`, {

        oracleConfirmation: {        oracleConfirmation: {

          confirmed: true,          confirmed: true,

          confirmationId: `oracle-${Date.now()}`          confirmationId: `oracle-${Date.now()}`

        }        }

      })      })



      if (response.data.success) {      if (response.data.success) {

        await fetchCountryData(selectedCountry)        await fetchCountryData(selectedCountry)

        await fetchGenesisStatus()        await fetchGenesisStatus()

      }      }

    } catch (err) {    } catch (err) {

      console.error('Error executing instantiation:', err)      console.error('Error executing instantiation:', err)

      setError('Failed to execute instantiation protocol.')      setError('Failed to execute instantiation protocol.')

    } finally {    } finally {

      setInstantiating(false)      setInstantiating(false)

    }    }

  }  }



  const stats = genesisStatus ? [  const stats = genesisStatus ? [

    { label: 'Total Allocation', value: `${(genesisStatus.globalGenesisFund.totalAllocation / 1000000).toFixed(0)}M AZR`, change: 'Funded' },    { label: 'Total Allocation', value: `${(genesisStatus.globalGenesisFund.totalAllocation / 1000000).toFixed(0)}M AZR`, change: 'Funded' },

    { label: 'Available Funds', value: `${(genesisStatus.globalGenesisFund.available / 1000000).toFixed(0)}M AZR`, change: 'Ready' },    { label: 'Available Funds', value: `${(genesisStatus.globalGenesisFund.available / 1000000).toFixed(0)}M AZR`, change: 'Ready' },

    { label: 'Instantiated Economies', value: genesisStatus.globalGenesisFund.instantiatedEconomies.toString(), change: '+2' },    { label: 'Instantiated Economies', value: genesisStatus.globalGenesisFund.instantiatedEconomies.toString(), change: '+2' },

    { label: 'Seed Grant Amount', value: `${(genesisStatus.seedGrantConfig.amountPerNation / 1000).toFixed(0)}K AZR`, change: 'Per nation' }    { label: 'Seed Grant Amount', value: `${(genesisStatus.seedGrantConfig.amountPerNation / 1000).toFixed(0)}K AZR`, change: 'Per nation' }

  ] : []  ] : []



  const actions = [  const actions = [

    { label: 'Refresh Status', onClick: fetchGenesisStatus },    { label: 'Refresh Status', onClick: fetchGenesisStatus },

    { label: 'View Fund Details', onClick: () => console.log('View fund details') }    { label: 'View Fund Details', onClick: () => console.log('View fund details') }

  ]  ]



  if (loading) {  if (loading) {

    return (    return (

      <ServicePanel      <ServicePanel

        title="Compliance & Global Genesis"        title="Compliance & Global Genesis"

        description="Regulatory compliance and planetary economic instantiation"        description="Regulatory compliance and planetary economic instantiation"

        stats={stats}        stats={stats}

        actions={actions}        actions={actions}

      >      >

        <div className="animate-pulse space-y-4">        <div className="animate-pulse space-y-4">

          <div className="h-4 bg-gray-200 rounded w-3/4"></div>          <div className="h-4 bg-gray-200 rounded w-3/4"></div>

          <div className="h-4 bg-gray-200 rounded w-1/2"></div>          <div className="h-4 bg-gray-200 rounded w-1/2"></div>

          <div className="h-4 bg-gray-200 rounded w-2/3"></div>          <div className="h-4 bg-gray-200 rounded w-2/3"></div>

        </div>        </div>

      </ServicePanel>      </ServicePanel>

    )    )

  }  }



  return (  return (

    <ServicePanel    <ServicePanel

      title="Compliance & Global Genesis"      title="Compliance & Global Genesis"

      description="Regulatory compliance and planetary economic instantiation"      description="Regulatory compliance and planetary economic instantiation"

      stats={stats}      stats={stats}

      actions={actions}      actions={actions}

    >    >

      {error && (      {error && (

        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">

          <p className="text-red-600 text-sm">{error}</p>          <p className="text-red-600 text-sm">{error}</p>

        </div>        </div>

      )}      )}



      <div className="space-y-6">      <div className="space-y-6">

        {/* Country Management */}        {/* Country Management */}

        <div>        <div>

          <h3 className="text-lg font-semibold mb-3">Country Activation Management</h3>          <h3 className="text-lg font-semibold mb-3">Country Activation Management</h3>

          <div className="mb-4">          <div className="mb-4">

            <select            <select

              value={selectedCountry}              value={selectedCountry}

              onChange={(e) => {              onChange={(e) => {

                setSelectedCountry(e.target.value)                setSelectedCountry(e.target.value)

                fetchCountryData(e.target.value)                fetchCountryData(e.target.value)

              }}              }}

              className="w-full p-2 border border-border rounded-md"              className="w-full p-2 border border-border rounded-md"

            >            >

              <option value="">Select a country</option>              <option value="">Select a country</option>

              {Array.from(new Set(countries.map(c => c.country).concat([              {Array.from(new Set(countries.map(c => c.country).concat([

                'South Africa', 'United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'China', 'India', 'Brazil', 'Canada'                'South Africa', 'United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'China', 'India', 'Brazil', 'Canada'

              ]))).map(country => (              ]))).map(country => (

                <option key={country} value={country}>{country}</option>                <option key={country} value={country}>{country}</option>

              ))}              ))}

            </select>            </select>

          </div>          </div>



          {countryData && (          {countryData && (

            <div className="space-y-4">            <div className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="p-4 border rounded-lg">                <div className="p-4 border rounded-lg">

                  <h4 className="font-semibold mb-2">Sovereign Seed Grant</h4>                  <h4 className="font-semibold mb-2">Sovereign Seed Grant</h4>

                  <p className="text-2xl font-bold">{(countryData.sovereignSeedGrant.amount / 1000).toFixed(0)}K AZR</p>                  <p className="text-2xl font-bold">{(countryData.sovereignSeedGrant.amount / 1000).toFixed(0)}K AZR</p>

                  <span className={`px-2 py-1 rounded text-xs ${                  <span className={`px-2 py-1 rounded text-xs ${

                    countryData.sovereignSeedGrant.status === 'escrowed' ? 'bg-yellow-100 text-yellow-800' :                    countryData.sovereignSeedGrant.status === 'escrowed' ? 'bg-yellow-100 text-yellow-800' :

                    countryData.sovereignSeedGrant.status === 'released' ? 'bg-green-100 text-green-800' :                    countryData.sovereignSeedGrant.status === 'released' ? 'bg-green-100 text-green-800' :

                    'bg-blue-100 text-blue-800'                    'bg-blue-100 text-blue-800'

                  }`}>                  }`}>

                    {countryData.sovereignSeedGrant.status}                    {countryData.sovereignSeedGrant.status}

                  </span>                  </span>

                </div>                </div>



                <div className="p-4 border rounded-lg">                <div className="p-4 border rounded-lg">

                  <h4 className="font-semibold mb-2">User Threshold</h4>                  <h4 className="font-semibold mb-2">User Threshold</h4>

                  <p className="text-lg">{countryData.activationStatus.userThreshold.current.toLocaleString()} / {countryData.activationStatus.userThreshold.required.toLocaleString()}</p>                  <p className="text-lg">{countryData.activationStatus.userThreshold.current.toLocaleString()} / {countryData.activationStatus.userThreshold.required.toLocaleString()}</p>

                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">

                    <div                    <div

                      className="bg-blue-600 h-2 rounded-full"                      className="bg-blue-600 h-2 rounded-full"

                      style={{ width: `${Math.min((countryData.activationStatus.userThreshold.current / countryData.activationStatus.userThreshold.required) * 100, 100)}%` }}                      style={{ width: `${Math.min((countryData.activationStatus.userThreshold.current / countryData.activationStatus.userThreshold.required) * 100, 100)}%` }}

                    ></div>                    ></div>

                  </div>                  </div>

                </div>                </div>



                <div className="p-4 border rounded-lg">                <div className="p-4 border rounded-lg">

                  <h4 className="font-semibold mb-2">Economy Status</h4>                  <h4 className="font-semibold mb-2">Economy Status</h4>

                  <p className="text-lg">{countryData.economyStatus.instantiated ? 'Instantiated' : 'Pending'}</p>                  <p className="text-lg">{countryData.economyStatus.instantiated ? 'Instantiated' : 'Pending'}</p>

                  {countryData.economyStatus.localToken && (                  {countryData.economyStatus.localToken && (

                    <p className="text-sm text-muted-foreground">Token: {countryData.economyStatus.localToken}</p>                    <p className="text-sm text-muted-foreground">Token: {countryData.economyStatus.localToken}</p>

                  )}                  )}

                </div>                </div>

              </div>              </div>



              {/* Activation Triggers */}              {/* Activation Triggers */}

              <div className="space-y-4">              <div className="space-y-4">

                <h4 className="text-lg font-semibold">Activation Triggers</h4>                <h4 className="text-lg font-semibold">Activation Triggers</h4>



                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div className="p-4 border rounded-lg space-y-2">                  <div className="p-4 border rounded-lg space-y-2">

                    <h5 className="font-medium">User Threshold</h5>                    <h5 className="font-medium">User Threshold</h5>

                    <input                    <input

                      type="number"                      type="number"

                      placeholder="User count"                      placeholder="User count"

                      value={triggerData.userCount}                      value={triggerData.userCount}

                      onChange={(e) => setTriggerData({...triggerData, userCount: e.target.value})}                      onChange={(e) => setTriggerData({...triggerData, userCount: e.target.value})}

                      className="w-full p-2 border border-border rounded"                      className="w-full p-2 border border-border rounded"

                    />                    />

                    <button                    <button

                      onClick={() => checkActivationTrigger('userThreshold')}                      onClick={() => checkActivationTrigger('userThreshold')}

                      disabled={checkingTrigger}                      disabled={checkingTrigger}

                      className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"                      className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"

                    >                    >

                      {checkingTrigger ? 'Checking...' : 'Check Threshold'}                      {checkingTrigger ? 'Checking...' : 'Check Threshold'}

                    </button>                    </button>

                  </div>                  </div>



                  <div className="p-4 border rounded-lg space-y-2">                  <div className="p-4 border rounded-lg space-y-2">

                    <h5 className="font-medium">University Treaty</h5>                    <h5 className="font-medium">University Treaty</h5>

                    <input                    <input

                      placeholder="University name"                      placeholder="University name"

                      value={triggerData.university}                      value={triggerData.university}

                      onChange={(e) => setTriggerData({...triggerData, university: e.target.value})}                      onChange={(e) => setTriggerData({...triggerData, university: e.target.value})}

                      className="w-full p-2 border border-border rounded"                      className="w-full p-2 border border-border rounded"

                    />                    />

                    <button                    <button

                      onClick={() => checkActivationTrigger('universityTreaty')}                      onClick={() => checkActivationTrigger('universityTreaty')}

                      disabled={checkingTrigger}                      disabled={checkingTrigger}

                      className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"                      className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"

                    >                    >

                      {checkingTrigger ? 'Checking...' : 'Sign Treaty'}                      {checkingTrigger ? 'Checking...' : 'Sign Treaty'}

                    </button>                    </button>

                  </div>                  </div>



                  <div className="p-4 border rounded-lg space-y-2">                  <div className="p-4 border rounded-lg space-y-2">

                    <h5 className="font-medium">Founding Team</h5>                    <h5 className="font-medium">Founding Team</h5>

                    <input                    <input

                      type="number"                      type="number"

                      placeholder="Team size"                      placeholder="Team size"

                      value={triggerData.teamSize}                      value={triggerData.teamSize}

                      onChange={(e) => setTriggerData({...triggerData, teamSize: e.target.value})}                      onChange={(e) => setTriggerData({...triggerData, teamSize: e.target.value})}

                      className="w-full p-2 border border-border rounded"                      className="w-full p-2 border border-border rounded"

                    />                    />

                    <button                    <button

                      onClick={() => checkActivationTrigger('foundingTeam')}                      onClick={() => checkActivationTrigger('foundingTeam')}

                      disabled={checkingTrigger}                      disabled={checkingTrigger}

                      className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"                      className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"

                    >                    >

                      {checkingTrigger ? 'Checking...' : 'Submit Petition'}                      {checkingTrigger ? 'Checking...' : 'Submit Petition'}

                    </button>                    </button>

                  </div>                  </div>

                </div>                </div>



                {countryData.oracleConfirmation && (                {countryData.oracleConfirmation && (

                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">

                    <p className="text-green-600 text-sm">Oracle confirmation received! Ready for instantiation.</p>                    <p className="text-green-600 text-sm">Oracle confirmation received! Ready for instantiation.</p>

                  </div>                  </div>

                )}                )}



                <button                <button

                  onClick={executeInstantiation}                  onClick={executeInstantiation}

                  disabled={instantiating || !countryData.oracleConfirmation}                  disabled={instantiating || !countryData.oracleConfirmation}

                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"

                >                >

                  {instantiating ? 'Executing Instantiation Protocol...' : 'Execute Instantiation Protocol'}                  {instantiating ? 'Executing Instantiation Protocol...' : 'Execute Instantiation Protocol'}

                </button>                </button>

              </div>              </div>

            </div>            </div>

          )}          )}

        </div>        </div>



        {/* Instantiated Economies List */}        {/* Instantiated Economies List */}

        <div>        <div>

          <h3 className="text-lg font-semibold mb-3">Instantiated Economies</h3>          <h3 className="text-lg font-semibold mb-3">Instantiated Economies</h3>

          <div className="space-y-3">          <div className="space-y-3">

            {countries.map(country => (            {countries.map(country => (

              <div key={country.country} className="flex items-center justify-between p-4 border rounded-lg">              <div key={country.country} className="flex items-center justify-between p-4 border rounded-lg">

                <div className="flex items-center gap-3">                <div className="flex items-center gap-3">

                  <div>                  <div>

                    <p className="font-medium">{country.country}</p>                    <p className="font-medium">{country.country}</p>

                    <p className="text-sm text-muted-foreground">{country.region}</p>                    <p className="text-sm text-muted-foreground">{country.region}</p>

                  </div>                  </div>

                </div>                </div>

                <div className="flex items-center gap-3">                <div className="flex items-center gap-3">

                  {country.localToken && (                  {country.localToken && (

                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">

                      {country.localToken}                      {country.localToken}

                    </span>                    </span>

                  )}                  )}

                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">

                    Instantiated                    Instantiated

                  </span>                  </span>

                </div>                </div>

              </div>              </div>

            ))}            ))}

          </div>          </div>

        </div>        </div>

      </div>      </div>

    </ServicePanel>    </ServicePanel>

  )  )

}}



export default CompliancePanelexport default CompliancePanel

  const [error, setError] = useState(null)const CompliancePanel = () => {

  const [triggerData, setTriggerData] = useState({  const [genesisStatus, setGenesisStatus] = useState(null)

    userCount: '',  const [countries, setCountries] = useState([])

    university: '',  const [selectedCountry, setSelectedCountry] = useState('')

    teamSize: ''  const [countryData, setCountryData] = useState(null)

  })  const [loading, setLoading] = useState(true)

  const [checkingTrigger, setCheckingTrigger] = useState(false)

  useEffect(() => {  const [instantiating, setInstantiating] = useState(false)

    fetchGenesisStatus()  const [error, setError] = useState(null)

  }, [])  const [triggerData, setTriggerData] = useState({

    userCount: '',

  const fetchGenesisStatus = async () => {    university: '',

    try {    teamSize: ''

      setLoading(true)  })

      setError(null)

  useEffect(() => {

      const response = await axios.get('http://localhost:4099/api/citadel/genesis/status')    fetchGenesisStatus()

      setGenesisStatus(response.data)  }, [])



      const countriesResponse = await axios.get('http://localhost:4099/api/citadel/economies')  const fetchGenesisStatus = async () => {

      setCountries(countriesResponse.data.economies || [])    try {

    } catch (err) {      setLoading(true)

      console.error('Error fetching genesis status:', err)      setError(null)

      setError('Failed to load compliance data. Using mock data.')

      const response = await axios.get('http://localhost:4099/api/citadel/genesis/status')

      setGenesisStatus({      setGenesisStatus(response.data)

        globalGenesisFund: {

          totalAllocation: 195000000,      // Get all countries from the registry

          allocated: 25000000,      const countriesResponse = await axios.get('http://localhost:4099/api/citadel/economies')

          available: 170000000,      setCountries(countriesResponse.data.economies || [])

          nationsCovered: 195,    } catch (err) {

          instantiatedEconomies: 25      console.error('Error fetching genesis status:', err)

        },      setError('Failed to load compliance data. Using mock data.')

        seedGrantConfig: {

          amountPerNation: 1000000,      // Mock data fallback

          totalNations: 195,      setGenesisStatus({

          escrowStatus: 'active'        globalGenesisFund: {

        }          totalAllocation: 195000000,

      })          allocated: 25000000,

          available: 170000000,

      setCountries([          nationsCovered: 195,

        { country: 'South Africa', region: 'Africa', localToken: 'aZAR', instantiationDate: '2024-01-15' },          instantiatedEconomies: 25

        { country: 'United States', region: 'Americas', localToken: 'aUSD', instantiationDate: '2024-01-20' },        },

        { country: 'United Kingdom', region: 'Europe', localToken: 'aGBP', instantiationDate: '2024-01-25' },        seedGrantConfig: {

      ])          amountPerNation: 1000000,

    } finally {          totalNations: 195,

      setLoading(false)          escrowStatus: 'active'

    }        }

  }      })



  const fetchCountryData = async (country) => {      setCountries([

    if (!country) return        { country: 'South Africa', region: 'Africa', localToken: 'aZAR', instantiationDate: '2024-01-15' },

        { country: 'United States', region: 'Americas', localToken: 'aUSD', instantiationDate: '2024-01-20' },

    try {        { country: 'United Kingdom', region: 'Europe', localToken: 'aGBP', instantiationDate: '2024-01-25' },

      const response = await axios.get(`http://localhost:4099/api/citadel/grants/${encodeURIComponent(country)}`)      ])

      setCountryData(response.data)    } finally {

    } catch (err) {      setLoading(false)

      console.error('Error fetching country data:', err)    }

      setError('Failed to load country data.')  }



      setCountryData({  const fetchCountryData = async (country) => {

        country,    if (!country) return

        region: 'Africa',

        sovereignSeedGrant: {    try {

          amount: 1000000,      const response = await axios.get(`http://localhost:4099/api/citadel/grants/${encodeURIComponent(country)}`)

          status: 'escrowed',      setCountryData(response.data)

          escrowId: 'escrow-123'    } catch (err) {

        },      console.error('Error fetching country data:', err)

        activationStatus: {      setError('Failed to load country data.')

          userThreshold: { current: 5000, required: 10000, achieved: false },

          universityTreaty: { status: 'pending' },      // Mock data fallback

          foundingTeam: { status: 'pending' }      setCountryData({

        },        country,

        economyStatus: {        region: 'Africa',

          instantiated: false,        sovereignSeedGrant: {

          localToken: null          amount: 1000000,

        }          status: 'escrowed',

      })          escrowId: 'escrow-123'

    }        },

  }        activationStatus: {

          userThreshold: { current: 5000, required: 10000, achieved: false },

  const checkActivationTrigger = async (triggerType) => {          universityTreaty: { status: 'pending' },

    if (!selectedCountry) return          foundingTeam: { status: 'pending' }

        },

    try {        economyStatus: {

      setCheckingTrigger(true)          instantiated: false,

      setError(null)          localToken: null

        }

      let triggerPayload = { country: selectedCountry, triggerType }      })

    }

      switch (triggerType) {  }

        case 'userThreshold':

          triggerPayload.triggerData = { userCount: parseInt(triggerData.userCount) || 0 }  const checkActivationTrigger = async (triggerType) => {

          break    if (!selectedCountry) return

        case 'universityTreaty':

          triggerPayload.triggerData = {    try {

            status: 'signed',      setCheckingTrigger(true)

            university: triggerData.university      setError(null)

          }

          break      let triggerPayload = { country: selectedCountry, triggerType }

        case 'foundingTeam':

          triggerPayload.triggerData = {      switch (triggerType) {

            petitionId: `petition-${Date.now()}`,        case 'userThreshold':

            teamSize: parseInt(triggerData.teamSize) || 0          triggerPayload.triggerData = { userCount: parseInt(triggerData.userCount) || 0 }

          }          break

          break        case 'universityTreaty':

      }          triggerPayload.triggerData = {

            status: 'signed',

      const response = await axios.post('http://localhost:4099/api/citadel/triggers/check', triggerPayload)            university: triggerData.university

          }

      if (response.data.success) {          break

        await fetchCountryData(selectedCountry)        case 'foundingTeam':

        await fetchGenesisStatus()          triggerPayload.triggerData = {

      }            petitionId: `petition-${Date.now()}`,

    } catch (err) {            teamSize: parseInt(triggerData.teamSize) || 0

      console.error('Error checking trigger:', err)          }

      setError('Failed to check activation trigger.')          break

    } finally {      }

      setCheckingTrigger(false)

    }      const response = await axios.post('http://localhost:4099/api/citadel/triggers/check', triggerPayload)

  }

      if (response.data.success) {

  const executeInstantiation = async () => {        // Refresh country data

    if (!selectedCountry) return        await fetchCountryData(selectedCountry)

        await fetchGenesisStatus()

    try {      }

      setInstantiating(true)    } catch (err) {

      setError(null)      console.error('Error checking trigger:', err)

      setError('Failed to check activation trigger.')

      const response = await axios.post(`http://localhost:4099/api/citadel/instantiate/${encodeURIComponent(selectedCountry)}`, {    } finally {

        oracleConfirmation: {      setCheckingTrigger(false)

          confirmed: true,    }

          confirmationId: `oracle-${Date.now()}`  }

        }

      })  const executeInstantiation = async () => {

    if (!selectedCountry) return

      if (response.data.success) {

        await fetchCountryData(selectedCountry)    try {

        await fetchGenesisStatus()      setInstantiating(true)

      }      setError(null)

    } catch (err) {

      console.error('Error executing instantiation:', err)      const response = await axios.post(`http://localhost:4099/api/citadel/instantiate/${encodeURIComponent(selectedCountry)}`, {

      setError('Failed to execute instantiation protocol.')        oracleConfirmation: {

    } finally {          confirmed: true,

      setInstantiating(false)          confirmationId: `oracle-${Date.now()}`

    }        }

  }      })



  const stats = genesisStatus ? [      if (response.data.success) {

    { label: 'Total Allocation', value: `${(genesisStatus.globalGenesisFund.totalAllocation / 1000000).toFixed(0)}M AZR`, change: 'Funded' },        // Refresh data

    { label: 'Available Funds', value: `${(genesisStatus.globalGenesisFund.available / 1000000).toFixed(0)}M AZR`, change: 'Ready' },        await fetchCountryData(selectedCountry)

    { label: 'Instantiated Economies', value: genesisStatus.globalGenesisFund.instantiatedEconomies.toString(), change: '+2' },        await fetchGenesisStatus()

    { label: 'Seed Grant Amount', value: `${(genesisStatus.seedGrantConfig.amountPerNation / 1000).toFixed(0)}K AZR`, change: 'Per nation' }      }

  ] : []    } catch (err) {

      console.error('Error executing instantiation:', err)

  const actions = [      setError('Failed to execute instantiation protocol.')

    { label: 'Refresh Status', onClick: fetchGenesisStatus },    } finally {

    { label: 'View Fund Details', onClick: () => console.log('View fund details') }      setInstantiating(false)

  ]    }

  }

  if (loading) {

    return (  const getStatusBadge = (status) => {

      <ServicePanel    const variants = {

        title="Compliance & Global Genesis"      escrowed: 'secondary',

        description="Regulatory compliance and planetary economic instantiation"      released: 'default',

        stats={stats}      instantiated: 'default',

        actions={actions}      pending: 'outline',

      >      signed: 'default',

        <div className="animate-pulse space-y-4">      petitioned: 'default'

          <div className="h-4 bg-gray-200 rounded w-3/4"></div>    }

          <div className="h-4 bg-gray-200 rounded w-1/2"></div>    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>

          <div className="h-4 bg-gray-200 rounded w-2/3"></div>  }

        </div>

      </ServicePanel>  const getProgressColor = (current, required) => {

    )    const percentage = (current / required) * 100

  }    if (percentage >= 100) return '#10b981'

    if (percentage >= 75) return '#f59e0b'

  return (    return '#ef4444'

    <ServicePanel  }

      title="Compliance & Global Genesis"

      description="Regulatory compliance and planetary economic instantiation"  if (loading) {

      stats={stats}    return (

      actions={actions}      <div className="p-6">

    >        <div className="animate-pulse space-y-4">

      {error && (          <div className="h-8 bg-gray-200 rounded w-1/4"></div>

        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          <p className="text-red-600 text-sm">{error}</p>            {[...Array(4)].map((_, i) => (

        </div>              <div key={i} className="h-24 bg-gray-200 rounded"></div>

      )}            ))}

          </div>

      <div className="space-y-6">        </div>

        {/* Country Management */}      </div>

        <div>    )

          <h3 className="text-lg font-semibold mb-3">Country Activation Management</h3>  }

          <div className="mb-4">

            <select  const fundData = genesisStatus ? [

              value={selectedCountry}    { name: 'Allocated', value: genesisStatus.globalGenesisFund.allocated, color: '#10b981' },

              onChange={(e) => {    { name: 'Available', value: genesisStatus.globalGenesisFund.available, color: '#3b82f6' },

                setSelectedCountry(e.target.value)  ] : []

                fetchCountryData(e.target.value)

              }}  const regionData = countries.reduce((acc, country) => {

              className="w-full p-2 border border-border rounded-md"    const region = country.region || 'Unknown'

            >    acc[region] = (acc[region] || 0) + 1

              <option value="">Select a country</option>    return acc

              {Array.from(new Set(countries.map(c => c.country).concat([  }, {})

                'South Africa', 'United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'China', 'India', 'Brazil', 'Canada'

              ]))).map(country => (  const regionChartData = Object.entries(regionData).map(([region, count]) => ({

                <option key={country} value={country}>{country}</option>    name: region,

              ))}    value: count,

            </select>  }))

          </div>

  return (

          {countryData && (    <div className="p-6 space-y-6">

            <div className="space-y-4">      <div className="flex justify-between items-center">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">        <div>

                <div className="p-4 border rounded-lg">          <h1 className="text-3xl font-bold">Compliance & Global Genesis</h1>

                  <h4 className="font-semibold mb-2">Sovereign Seed Grant</h4>          <p className="text-gray-600">Regulatory compliance and planetary economic instantiation</p>

                  <p className="text-2xl font-bold">{(countryData.sovereignSeedGrant.amount / 1000).toFixed(0)}K AZR</p>        </div>

                  <span className={`px-2 py-1 rounded text-xs ${        <Button onClick={fetchGenesisStatus}>

                    countryData.sovereignSeedGrant.status === 'escrowed' ? 'bg-yellow-100 text-yellow-800' :          <Shield className="h-4 w-4 mr-2" />

                    countryData.sovereignSeedGrant.status === 'released' ? 'bg-green-100 text-green-800' :          Refresh Status

                    'bg-blue-100 text-blue-800'        </Button>

                  }`}>      </div>

                    {countryData.sovereignSeedGrant.status}

                  </span>      {error && (

                </div>        <Alert>

          <AlertTriangle className="h-4 w-4" />

                <div className="p-4 border rounded-lg">          <AlertDescription>{error}</AlertDescription>

                  <h4 className="font-semibold mb-2">User Threshold</h4>        </Alert>

                  <p className="text-lg">{countryData.activationStatus.userThreshold.current.toLocaleString()} / {countryData.activationStatus.userThreshold.required.toLocaleString()}</p>      )}

                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">

                    <div      {/* Global Genesis Fund Stats */}

                      className="bg-blue-600 h-2 rounded-full"      {genesisStatus && (

                      style={{ width: `${Math.min((countryData.activationStatus.userThreshold.current / countryData.activationStatus.userThreshold.required) * 100, 100)}%` }}        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    ></div>          <Card>

                  </div>            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

                </div>              <CardTitle className="text-sm font-medium">Total Allocation</CardTitle>

              <DollarSign className="h-4 w-4 text-muted-foreground" />

                <div className="p-4 border rounded-lg">            </CardHeader>

                  <h4 className="font-semibold mb-2">Economy Status</h4>            <CardContent>

                  <p className="text-lg">{countryData.economyStatus.instantiated ? 'Instantiated' : 'Pending'}</p>              <div className="text-2xl font-bold">

                  {countryData.economyStatus.localToken && (                {(genesisStatus.globalGenesisFund.totalAllocation / 1000000).toFixed(0)}M AZR

                    <p className="text-sm text-muted-foreground">Token: {countryData.economyStatus.localToken}</p>              </div>

                  )}              <p className="text-xs text-muted-foreground">

                </div>                Global Genesis Fund

              </div>              </p>

            </CardContent>

              {/* Activation Triggers */}          </Card>

              <div className="space-y-4">

                <h4 className="text-lg font-semibold">Activation Triggers</h4>          <Card>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">              <CardTitle className="text-sm font-medium">Available Funds</CardTitle>

                  <div className="p-4 border rounded-lg space-y-2">              <Globe className="h-4 w-4 text-muted-foreground" />

                    <h5 className="font-medium">User Threshold</h5>            </CardHeader>

                    <input            <CardContent>

                      type="number"              <div className="text-2xl font-bold">

                      placeholder="User count"                {(genesisStatus.globalGenesisFund.available / 1000000).toFixed(0)}M AZR

                      value={triggerData.userCount}              </div>

                      onChange={(e) => setTriggerData({...triggerData, userCount: e.target.value})}              <p className="text-xs text-muted-foreground">

                      className="w-full p-2 border border-border rounded"                Ready for deployment

                    />              </p>

                    <button            </CardContent>

                      onClick={() => checkActivationTrigger('userThreshold')}          </Card>

                      disabled={checkingTrigger}

                      className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"          <Card>

                    >            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

                      {checkingTrigger ? 'Checking...' : 'Check Threshold'}              <CardTitle className="text-sm font-medium">Instantiated Economies</CardTitle>

                    </button>              <CheckCircle className="h-4 w-4 text-muted-foreground" />

                  </div>            </CardHeader>

            <CardContent>

                  <div className="p-4 border rounded-lg space-y-2">              <div className="text-2xl font-bold">{genesisStatus.globalGenesisFund.instantiatedEconomies}</div>

                    <h5 className="font-medium">University Treaty</h5>              <p className="text-xs text-muted-foreground">

                    <input                Of {genesisStatus.globalGenesisFund.nationsCovered} nations

                      placeholder="University name"              </p>

                      value={triggerData.university}            </CardContent>

                      onChange={(e) => setTriggerData({...triggerData, university: e.target.value})}          </Card>

                      className="w-full p-2 border border-border rounded"

                    />          <Card>

                    <button            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

                      onClick={() => checkActivationTrigger('universityTreaty')}              <CardTitle className="text-sm font-medium">Seed Grant Amount</CardTitle>

                      disabled={checkingTrigger}              <Users className="h-4 w-4 text-muted-foreground" />

                      className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"            </CardHeader>

                    >            <CardContent>

                      {checkingTrigger ? 'Checking...' : 'Sign Treaty'}              <div className="text-2xl font-bold">

                    </button>                {(genesisStatus.seedGrantConfig.amountPerNation / 1000).toFixed(0)}K AZR

                  </div>              </div>

              <p className="text-xs text-muted-foreground">

                  <div className="p-4 border rounded-lg space-y-2">                Per nation

                    <h5 className="font-medium">Founding Team</h5>              </p>

                    <input            </CardContent>

                      type="number"          </Card>

                      placeholder="Team size"        </div>

                      value={triggerData.teamSize}      )}

                      onChange={(e) => setTriggerData({...triggerData, teamSize: e.target.value})}

                      className="w-full p-2 border border-border rounded"      {/* Charts */}

                    />      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <button        <Card>

                      onClick={() => checkActivationTrigger('foundingTeam')}          <CardHeader>

                      disabled={checkingTrigger}            <CardTitle>Genesis Fund Distribution</CardTitle>

                      className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"          </CardHeader>

                    >          <CardContent>

                      {checkingTrigger ? 'Checking...' : 'Submit Petition'}            <ResponsiveContainer width="100%" height={300}>

                    </button>              <PieChart>

                  </div>                <Pie

                </div>                  data={fundData}

                  cx="50%"

                {countryData.oracleConfirmation && (                  cy="50%"

                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">                  labelLine={false}

                    <p className="text-green-600 text-sm">Oracle confirmation received! Ready for instantiation.</p>                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}

                  </div>                  outerRadius={80}

                )}                  fill="#8884d8"

                  dataKey="value"

                <button                >

                  onClick={executeInstantiation}                  {fundData.map((entry, index) => (

                  disabled={instantiating || !countryData.oracleConfirmation}                    <Cell key={`cell-${index}`} fill={entry.color} />

                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"                  ))}

                >                </Pie>

                  {instantiating ? 'Executing Instantiation Protocol...' : 'Execute Instantiation Protocol'}                <Tooltip formatter={(value) => [`${(value / 1000000).toFixed(1)}M AZR`, 'Amount']} />

                </button>              </PieChart>

              </div>            </ResponsiveContainer>

            </div>          </CardContent>

          )}        </Card>

        </div>

        <Card>

        {/* Instantiated Economies List */}          <CardHeader>

        <div>            <CardTitle>Instantiated Economies by Region</CardTitle>

          <h3 className="text-lg font-semibold mb-3">Instantiated Economies</h3>          </CardHeader>

          <div className="space-y-3">          <CardContent>

            {countries.map(country => (            <ResponsiveContainer width="100%" height={300}>

              <div key={country.country} className="flex items-center justify-between p-4 border rounded-lg">              <BarChart data={regionChartData}>

                <div className="flex items-center gap-3">                <CartesianGrid strokeDasharray="3 3" />

                  <div>                <XAxis dataKey="name" />

                    <p className="font-medium">{country.country}</p>                <YAxis />

                    <p className="text-sm text-muted-foreground">{country.region}</p>                <Tooltip />

                  </div>                <Bar dataKey="value" fill="#3b82f6" />

                </div>              </BarChart>

                <div className="flex items-center gap-3">            </ResponsiveContainer>

                  {country.localToken && (          </CardContent>

                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">        </Card>

                      {country.localToken}      </div>

                    </span>

                  )}      {/* Country Management */}

                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">      <Card>

                    Instantiated        <CardHeader>

                  </span>          <CardTitle>Country Activation Management</CardTitle>

                </div>        </CardHeader>

              </div>        <CardContent className="space-y-4">

            ))}          <div className="flex gap-4">

          </div>            <Select value={selectedCountry} onValueChange={(value) => {

        </div>              setSelectedCountry(value)

      </div>              fetchCountryData(value)

    </ServicePanel>            }}>

  )              <SelectTrigger className="w-64">

}                <SelectValue placeholder="Select a country" />

              </SelectTrigger>

export default CompliancePanel              <SelectContent>
                {Array.from(new Set(countries.map(c => c.country).concat([
                  'South Africa', 'United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'China', 'India', 'Brazil', 'Canada'
                ]))).map(country => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {countryData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Sovereign Seed Grant</h3>
                  <p className="text-2xl font-bold">{(countryData.sovereignSeedGrant.amount / 1000).toFixed(0)}K AZR</p>
                  {getStatusBadge(countryData.sovereignSeedGrant.status)}
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">User Threshold</h3>
                  <p className="text-lg">{countryData.activationStatus.userThreshold.current.toLocaleString()} / {countryData.activationStatus.userThreshold.required.toLocaleString()}</p>
                  <Progress
                    value={(countryData.activationStatus.userThreshold.current / countryData.activationStatus.userThreshold.required) * 100}
                    className="mt-2"
                  />
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Economy Status</h3>
                  <p className="text-lg">{countryData.economyStatus.instantiated ? 'Instantiated' : 'Pending'}</p>
                  {countryData.economyStatus.localToken && (
                    <p className="text-sm text-gray-600">Token: {countryData.economyStatus.localToken}</p>
                  )}
                </div>
              </div>

              {/* Activation Triggers */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Activation Triggers</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="font-medium">User Threshold</h4>
                    <Input
                      type="number"
                      placeholder="User count"
                      value={triggerData.userCount}
                      onChange={(e) => setTriggerData({...triggerData, userCount: e.target.value})}
                    />
                    <Button
                      onClick={() => checkActivationTrigger('userThreshold')}
                      disabled={checkingTrigger}
                      size="sm"
                      className="w-full"
                    >
                      {checkingTrigger ? 'Checking...' : 'Check Threshold'}
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="font-medium">University Treaty</h4>
                    <Input
                      placeholder="University name"
                      value={triggerData.university}
                      onChange={(e) => setTriggerData({...triggerData, university: e.target.value})}
                    />
                    <Button
                      onClick={() => checkActivationTrigger('universityTreaty')}
                      disabled={checkingTrigger}
                      size="sm"
                      className="w-full"
                    >
                      {checkingTrigger ? 'Checking...' : 'Sign Treaty'}
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="font-medium">Founding Team</h4>
                    <Input
                      type="number"
                      placeholder="Team size"
                      value={triggerData.teamSize}
                      onChange={(e) => setTriggerData({...triggerData, teamSize: e.target.value})}
                    />
                    <Button
                      onClick={() => checkActivationTrigger('foundingTeam')}
                      disabled={checkingTrigger}
                      size="sm"
                      className="w-full"
                    >
                      {checkingTrigger ? 'Checking...' : 'Submit Petition'}
                    </Button>
                  </div>
                </div>

                {countryData.oracleConfirmation && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Oracle confirmation received! Ready for instantiation.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={executeInstantiation}
                  disabled={instantiating || !countryData.oracleConfirmation}
                  className="w-full"
                >
                  {instantiating ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Executing Instantiation Protocol...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Execute Instantiation Protocol
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instantiated Economies List */}
      <Card>
        <CardHeader>
          <CardTitle>Instantiated Economies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {countries.map(country => (
              <div key={country.country} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{country.country}</p>
                    <p className="text-sm text-gray-500">{country.region}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {country.localToken && (
                    <Badge variant="outline">{country.localToken}</Badge>
                  )}
                  <Badge variant="default">Instantiated</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CompliancePanel