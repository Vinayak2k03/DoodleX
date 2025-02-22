import { Button } from "@repo/ui/components/button"
import { Hand } from "lucide-react"

export default function ActionBar(){
    return (
        <div className='fixed left-1/2 top-4'>
            <div className='flex items-center gap-1'>
                <Button size='icon' variant='ghost' title='Hand Tool (H)' className={'h-9 w-9 rounded-md'}>
                    <Hand className="h-5 w-5"/>
                </Button>
            </div>
        </div>
    )
}