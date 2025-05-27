import { Carousel, CarouselContent, CarouselItem } from "@/app/_components/ui/carousal"
import { QuoteIcon } from "lucide-react"

export const CarousalQuotes = () => {

    const items = [
        {
            quote: "Tried @supabase for the first time yesterday. Amazing tool! I was able to get my Posgres DB up in no time and their documentation on operating on the DB is super easy! 👏 Can't wait for Cloud functions to arrive! It's gonna be a great Firebase alternative!",
            author: "@codewithbhargav",
            image: "https://github.com/shadcn.png",
        },
        {
            quote: "Check out this amazing product @supabase. A must give try #newidea #opportunity",
            author: "@techenthusiast",
            image: "https://github.com/shadcn.png",
        },
        {
            quote: "Check out this amazing product @supabase. A must give try #newidea #opportunity",
            author: "@dataguru",
            image: "https://github.com/shadcn.png",
        },
    ];

    return (
        <>
            <Carousel showDots autoPlay autoPlayInterval={10000} className="w-full max-w-md" >
                <CarouselContent className="py-8">
                    {items.map((item, index) => (
                        <CarouselItem key={index} className="flex flex-col items-center justify-center">
                            <div className="relative flex flex-col items-start text-start">
                                {/* <QuoteIcon className="absolute h-20 w-20 text-muted opacity-80 -z-10 top-[-30px] transform rotate-180 " /> */}
                                <h2 className="text-3xl font-medium text-white mb-8">{item.quote}</h2>
                                <div className="flex items-center gap-4">
                                    <img
                                        src={item.image}
                                        alt="Profile"
                                        className="w-12 h-12 rounded-full"
                                    />
                                    <div>
                                        <p className="text-white font-medium">{item.author}</p>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </>
    )
}