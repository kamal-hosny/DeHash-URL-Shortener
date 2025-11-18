"use client";

import { Star, Quote, ChevronLeft, ChevronRight } from "@/assets/icons/index";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { testimonials } from "@/data";

const Testimonials = () => {
 

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 bg-secondary/30 border border-secondary/50 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4">
            <Quote className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm text-primary font-medium">
              Trusted by Thousands
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-accent px-4">
            What Our Users Say
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
            Join thousands of satisfied users who trust ShortURL for their link management needs
          </p>
        </div>

        {/* Swiper Container */}
        <div className="relative px-2 sm:px-0">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 1,
                spaceBetween: 24,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
            }}
            navigation={{
              nextEl: ".swiper-button-next-testimonials",
              prevEl: ".swiper-button-prev-testimonials",
            }}
            pagination={{
              clickable: true,
              el: ".swiper-pagination-testimonials",
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            loop={true}
            className="!pb-12"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <div
                  className={`
                    group relative
                    rounded-2xl sm:rounded-3xl p-6 sm:p-8 h-full
                    backdrop-blur-xl
                    border border-border/50
                    shadow-lg hover:shadow-2xl
                    transition-all duration-500
                    hover:-translate-y-2
                    bg-gradient-to-br ${testimonial.gradient}
                    overflow-hidden
                  `}
                >
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Quote Icon */}
                  <div className="relative mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 sm:w-5 sm:h-5 fill-primary text-primary"
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-sm sm:text-base text-foreground/80 leading-relaxed mb-4 sm:mb-6 relative z-10">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="relative z-10">
                    <div className="font-semibold text-foreground text-sm sm:text-base">
                      {testimonial.name}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>

                  {/* Decorative Corner */}
                  <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <button
            className="swiper-button-prev-testimonials absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background shadow-lg flex items-center justify-center transition-all hover:scale-110 sm:-translate-x-4 md:-translate-x-6"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
          </button>
          <button
            className="swiper-button-next-testimonials absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background shadow-lg flex items-center justify-center transition-all hover:scale-110 sm:translate-x-4 md:translate-x-6"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
          </button>

          {/* Custom Pagination */}
          <div className="swiper-pagination-testimonials flex justify-center gap-2 mt-8"></div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;