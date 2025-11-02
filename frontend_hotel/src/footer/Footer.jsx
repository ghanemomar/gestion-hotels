import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <div  className="footer-section">
       <footer>
        <div class="container">
            <div class="footer-content">
                <h3>Contact Us</h3>
                <p>Email: ghanemomar@gmail.com</p>
                <p>Phone: +212 666 42 04 38</p>
                <p>Address: Your Address 123 street</p>
            </div>
            <div class="footer-content">
                <h3>Quick Links</h3>
                 <ul class="list">
                    <li><a href="#">Home</a></li>
                    <li><a href="#">About</a></li>
                    <li><a href="#">Services</a></li>
                    <li><a href="#">Products</a></li>
                    <li><a href="#">Contact</a></li>
                 </ul>
            </div>
            <div class="footer-content">
                <h3>Follow Us</h3>
                <ul class="social-icons">
                 <li><a href=""><i class="fab fa-facebook"></i></a></li>
                 <li><a href=""><i class="fab fa-twitter"></i></a></li>
                 <li><a href=""><i class="fab fa-instagram"></i></a></li>
                 <li><a href=""><i class="fab fa-linkedin"></i></a></li>
                </ul>
                </div>
        </div>
        <div class="bottom-bar">
            <p>&copy; 2026 your company . All rights reserved</p>
        </div>
    </footer>
    </div>
  );
}
