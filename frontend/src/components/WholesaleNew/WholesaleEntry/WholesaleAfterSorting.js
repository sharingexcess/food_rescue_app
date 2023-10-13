import {
  Button,
  Text,
  Flex,
  Box,
  Collapse,
  IconButton,
  Checkbox,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { ChevronDownIcon, ChevronUpIcon, DeleteIcon } from '@chakra-ui/icons'
import { AfterSortingPallet } from './AfterSortingPallet'

export function WholesaleAfterSorting({ setSummary, isSorted, summary }) {
  const [sorted, setSorted] = useState(false)
  const [pallets, setPallets] = useState([
    {
      id: 1,
      isOpen: true,
      caseCount: 0,
      caseWeight: 0,
      totalWeight: 0,
      palletType: '',
    },
  ])

  useEffect(() => {
    // Calculate the total case count
    const totalCaseCount = pallets.reduce(
      (sum, pallet) => sum + pallet.caseCount,
      0
    )

    // Calculate the total weight
    const totalWeight = pallets.reduce(
      (sum, pallet) => sum + pallet.totalWeight,
      0
    )

    // Calculate the average case weight
    const totalCaseWeight = pallets.reduce(
      (sum, pallet) => sum + pallet.caseWeight * pallet.caseCount,
      0
    )
    const averageCaseWeight = totalCaseCount
      ? totalCaseWeight / totalCaseCount
      : 0

    // Initialize the summary
    if (totalWeight === 0 && totalCaseCount === 0 && averageCaseWeight === 0) {
      setSummary({
        totalCaseCount: summary.totalCaseCount,
        averageCaseWeight: summary.averageCaseWeight,
        totalWeight: summary.totalWeight,
        sorted: summary.sorted,
      })
    } else {
      setSummary({
        totalCaseCount,
        averageCaseWeight,
        totalWeight,
        sorted,
      })
    }
  }, [pallets])

  const togglePalletOpen = id => {
    const updatedPallets = pallets.map(pallet =>
      pallet.id === id ? { ...pallet, isOpen: !pallet.isOpen } : pallet
    )
    setPallets(updatedPallets)
  }

  const deletePallet = id => {
    const updatedPallets = pallets.filter(pallet => pallet.id !== id)
    setPallets(updatedPallets)
  }

  const handleUpdate = (palletId, key, value) => {
    const updatedPallets = pallets.map(pallet => {
      if (pallet.id === palletId) {
        return { ...pallet, [key]: value }
      }
      return pallet
    })
    setPallets(updatedPallets)
  }

  return (
    <Flex direction="column" spacing={4}>
      <Flex direction="row" alignItems="center" mb={sorted === true ? 4 : 0}>
        <Text color="element.primary" fontSize="sm" fontWeight="600" mr="4">
          Sorted?
        </Text>
        <Checkbox
          isChecked={isSorted ? true : sorted === true}
          onChange={() => setSorted(!sorted)}
          mr="4"
        >
          Yes
        </Checkbox>
        <Checkbox
          isChecked={isSorted ? false : sorted === false}
          onChange={() => setSorted(!sorted)}
        >
          No
        </Checkbox>
      </Flex>

      {sorted === true && (
        <Flex direction="column" spacing={4}>
          {pallets.map(pallet => (
            <Box
              key={pallet.id}
              w="full"
              border="0.1px solid"
              borderColor="#363a3e"
              mb={2}
            >
              <Flex justifyContent="space-between" p="2" alignItems={'center'}>
                <IconButton
                  variant="ghosted"
                  onClick={() => togglePalletOpen(pallet.id)}
                >
                  {pallet.isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </IconButton>
                <Text>{pallet.isOpen ? '' : `Pallet ${pallet.id}`}</Text>
                <IconButton
                  variant="ghosted"
                  icon={<DeleteIcon />}
                  aria-label="Delete Pallet"
                  onClick={() => deletePallet(pallet.id)}
                />
              </Flex>
              <Collapse in={pallet.isOpen}>
                <AfterSortingPallet
                  onCaseCountChange={newCaseCount =>
                    handleUpdate(pallet.id, 'caseCount', newCaseCount)
                  }
                  onCaseWeightChange={newCaseWeight =>
                    handleUpdate(pallet.id, 'caseWeight', newCaseWeight)
                  }
                  onTotalWeightChange={newTotalWeight =>
                    handleUpdate(pallet.id, 'totalWeight', newTotalWeight)
                  }
                  onPalletTypeChange={newPalletType =>
                    handleUpdate(pallet.id, 'palletType', newPalletType)
                  }
                />
              </Collapse>
            </Box>
          ))}
          <Button
            onClick={() =>
              setPallets([...pallets, { id: pallets.length + 1, isOpen: true }])
            }
          >
            Add Pallet
          </Button>
        </Flex>
      )}
    </Flex>
  )
}
