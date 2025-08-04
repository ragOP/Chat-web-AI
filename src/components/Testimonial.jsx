import React from 'react'

const Testimonial = () => {
  const testimonials = [
    {
      id: 1,
      quote: "I was juggling bills and didn't think I'd qualify for anything, but MyBenefits AI found me $2,100 in food and medical benefits in literally 60 seconds. The report was awesome, and claiming was a breeze. Now my sister and parents are using it too—total game-changer! 😊",
      name: "Sarah Thompson",
      age: "42",
      location: "Houston, TX",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2,
      quote: "I'm not tech-savvy, but MyBenefits AI was so easy to use. It instantly showed me debt relief and healthcare benefits I was owed. Best $1 I've ever spent! I claimed everything in minutes, and now my buddies are all on board, claiming their benefits too.",
      name: "Michael Rodriguez",
      age: "58",
      location: "Miami, FL",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 3,
      quote: "Being a single mom, I'm always stretched thin. MyBenefits AI uncovered $1,900 in food assistance I almost missed out on. The report was clear, and the process to claim was super smooth. I've told all my friends, and they're signing up now. Thank you, MyBenefits AI!",
      name: "Emily Carter",
      age: "35",
      location: "Columbus, OH",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 4,
      quote: "Retirement's been tough, but MyBenefits AI found medical benefits I didn't know about in under a minute. It was instant, and the claims were a breeze to submit. My wife and I are so grateful, and we've spread the word to our whole retirement group.",
      name: "James Wilson",
      age: "67",
      location: "Raleigh, NC",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 5,
      quote: "I thought benefits were too complicated, but MyBenefits AI proved me wrong. For just $1, it showed me $1,500 in debt forgiveness and food aid in seconds. The report was awesome, and I claimed it all so fast. My roommates are now using it too—thanks, MyBenefits AI!",
      name: "Jessica Nguyen",
      age: "29",
      location: "San Diego, CA",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-1 lg:px-8 py-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-2">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className=" p-1 lg:p-8 relative flex flex-col">
            <div className=" rounded-xl p-6 mb-6 shadow-sm relative flex-1 bg-gray-50">
            <div className="absolute -bottom-4 left-2 w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-t-[30px] border-t-gray-50"></div>
              <p className="text-gray-700 italic text-sm sm:text-base leading-relaxed">
                "{testimonial.quote}"
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-auto">
              <img 
                src={testimonial.avatar} 
                alt={testimonial.name}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white shadow-md"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
                }}
              />
              <div className="">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                  {testimonial.name}
                </h4>
                <p className="text-gray-600 text-xs sm:text-sm">
                  {testimonial.age}, {testimonial.location}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Testimonial
